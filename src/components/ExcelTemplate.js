import React from 'react';
import { FaDownload, FaInfoCircle } from 'react-icons/fa';
import * as XLSX from 'xlsx';

const ExcelTemplate = () => {
  const downloadTemplate = () => {
    // Sample data for the template
    const templateData = [
      ['Name', 'Phone', 'Email', 'Category', 'Notes'],
      ['John Doe', '+1234567890', 'john@example.com', 'customer', 'Sample contact'],
      ['Jane Smith', '+0987654321', 'jane@example.com', 'lead', 'Potential customer'],
      ['Mike Johnson', '+1122334455', 'mike@example.com', 'prospect', 'Interested in services']
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);

    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Name
      { wch: 15 }, // Phone
      { wch: 25 }, // Email
      { wch: 12 }, // Category
      { wch: 30 }  // Notes
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts Template');

    // Generate and download the file
    const fileName = 'contacts_template.xlsx';
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div style={{ 
      background: '#f8f9fa', 
      border: '1px solid #dee2e6', 
      borderRadius: '8px', 
      padding: '20px', 
      marginBottom: '20px' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
        <FaInfoCircle style={{ color: '#007bff' }} />
        <h4 style={{ margin: 0, color: '#333' }}>Excel Import Instructions</h4>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          <strong>Required columns:</strong> Name, Phone
        </p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          <strong>Optional columns:</strong> Email, Category, Notes
        </p>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          <strong>Supported formats:</strong> .xlsx, .xls, .csv
        </p>
      </div>

      <button 
        onClick={downloadTemplate}
        style={{
          background: '#28a745',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px'
        }}
      >
        <FaDownload />
        Download Template
      </button>
    </div>
  );
};

export default ExcelTemplate;










