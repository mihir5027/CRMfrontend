import React, { useState, useEffect, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaFileExcel } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import DataModal from '../components/DataModal';
import ExcelTemplate from '../components/ExcelTemplate';

const Data = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [viewingData, setViewingData] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/data');
      setData(response.data);
    } catch (error) {
      toast.error('Failed to fetch data');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingData(null);
    setViewingData(null);
    setShowModal(true);
  };

  const handleEdit = (dataItem) => {
    setEditingData(dataItem);
    setViewingData(null);
    setShowModal(true);
  };

  const handleView = (dataItem) => {
    setViewingData(dataItem);
    setEditingData(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await axios.delete(`/api/data/${id}`);
        toast.success('Contact deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete contact');
        console.error('Error deleting data:', error);
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingData(null);
    setViewingData(null);
  };

  const handleModalSave = () => {
    fetchData();
    handleModalClose();
  };

  // Excel import functionality
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid Excel file (.xlsx, .xls) or CSV file');
      return;
    }

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          toast.error('Excel file must have at least a header row and one data row');
          setImporting(false);
          return;
        }

        // Process the Excel data
        const processedData = processExcelData(jsonData);
        
        if (processedData.length === 0) {
          toast.error('No valid data found in Excel file. Please check the format.');
          setImporting(false);
          return;
        }

        // Save the imported data
        await saveImportedData(processedData);
        
        toast.success(`Successfully imported ${processedData.length} contacts`);
        fetchData(); // Refresh the data table
        
      } catch (error) {
        console.error('Error processing Excel file:', error);
        toast.error('Error processing Excel file. Please check the file format.');
      } finally {
        setImporting(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const processExcelData = (jsonData) => {
    const processedData = [];
    const headers = jsonData[0].map(header => header?.toString().toLowerCase().trim());

    // Find name and phone columns
    const nameIndex = headers.findIndex(header => 
      header.includes('name') || header.includes('full name') || header.includes('first name')
    );
    const phoneIndex = headers.findIndex(header => 
      header.includes('phone') || header.includes('mobile') || header.includes('number') || 
      header.includes('contact') || header.includes('tel')
    );

    if (nameIndex === -1 || phoneIndex === -1) {
      toast.error('Excel file must contain "Name" and "Phone" columns');
      return [];
    }

    // Process data rows (skip header row)
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      const name = row[nameIndex]?.toString().trim();
      const phone = row[phoneIndex]?.toString().trim();

      // Validate required fields
      if (name && phone && name.length > 0 && phone.length > 0) {
        processedData.push({
          name: name,
          phone: phone,
          email: '', // Optional field
          category: 'customer', // Default category
          status: 'active', // Default status
          tags: [],
          notes: `Imported from Excel on ${new Date().toLocaleDateString()}`
        });
      }
    }

    return processedData;
  };

  const saveImportedData = async (importedData) => {
    try {
      // Use bulk import endpoint for better performance
      const response = await axios.post('/api/data/bulk-import', {
        contacts: importedData
      });
      
      if (response.data.errors && response.data.errors.length > 0) {
        console.warn('Some contacts failed to import:', response.data.errors);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error saving imported data:', error);
      throw new Error('Failed to save imported data');
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active: '#25d366',
      inactive: '#6c757d',
      pending: '#ffc107'
    };
    
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: statusColors[status] + '20',
        color: statusColors[status]
      }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const categoryColors = {
      customer: '#007bff',
      lead: '#28a745',
      prospect: '#17a2b8',
      vendor: '#6f42c1',
      other: '#6c757d'
    };
    
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: categoryColors[category] + '20',
        color: categoryColors[category]
      }}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    );
  };

  if (loading) {
    return <div className="loading">Loading contacts...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Contacts</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={triggerFileUpload}
            disabled={importing}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FaFileExcel />
            {importing ? 'Importing...' : 'Import Excel'}
          </button>
          <button className="btn btn-primary" onClick={handleCreate}>
            <FaPlus style={{ marginRight: '8px' }} />
            Add Contact
          </button>
        </div>
      </div>

      {/* Excel Template Instructions */}
      <ExcelTemplate />

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
      />

      {data.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3>No contacts yet</h3>
          <p>Add your first contact or import from Excel to get started</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button className="btn btn-secondary" onClick={triggerFileUpload}>
              <FaFileExcel style={{ marginRight: '8px' }} />
              Import Excel
            </button>
            <button className="btn btn-primary" onClick={handleCreate}>
              <FaPlus style={{ marginRight: '8px' }} />
              Add Contact
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Category</th>
                <th>Status</th>
                <th>Last Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div>
                      <strong>{item.name}</strong>
                      {item.notes && (
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          {item.notes.substring(0, 50)}...
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{item.phone}</td>
                  <td>{item.email || '-'}</td>
                  <td>{getCategoryBadge(item.category)}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td>{new Date(item.lastContact).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 8px', fontSize: '12px' }}
                        onClick={() => handleView(item)}
                        title="View"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '6px 8px', fontSize: '12px' }}
                        onClick={() => handleEdit(item)}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '6px 8px', fontSize: '12px' }}
                        onClick={() => handleDelete(item._id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <DataModal
          data={editingData}
          viewing={viewingData}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};

export default Data;
