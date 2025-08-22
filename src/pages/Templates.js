import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import TemplateModal from '../components/TemplateModal';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [viewingTemplate, setViewingTemplate] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/templates');
      setTemplates(response.data);
    } catch (error) {
      toast.error('Failed to fetch templates');
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setViewingTemplate(null);
    setShowModal(true);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setViewingTemplate(null);
    setShowModal(true);
  };

  const handleView = (template) => {
    setViewingTemplate(template);
    setEditingTemplate(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await axios.delete(`/api/templates/${id}`);
        toast.success('Template deleted successfully');
        fetchTemplates();
      } catch (error) {
        toast.error('Failed to delete template');
        console.error('Error deleting template:', error);
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setViewingTemplate(null);
  };

  const handleModalSave = () => {
    fetchTemplates();
    handleModalClose();
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
      marketing: '#007bff',
      support: '#28a745',
      notification: '#17a2b8',
      welcome: '#6f42c1',
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
    return <div className="loading">Loading templates...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Templates</h1>
        <button className="btn btn-primary" onClick={handleCreate}>
          <FaPlus style={{ marginRight: '8px' }} />
          Create Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h3>No templates yet</h3>
          <p>Create your first WhatsApp template to get started</p>
          <button className="btn btn-primary" onClick={handleCreate} style={{ marginTop: '20px' }}>
            <FaPlus style={{ marginRight: '8px' }} />
            Create Template
          </button>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Language</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template._id}>
                  <td>
                    <div>
                      <strong>{template.name}</strong>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        {template.content.substring(0, 50)}...
                      </div>
                    </div>
                  </td>
                  <td>{getCategoryBadge(template.category)}</td>
                  <td>{getStatusBadge(template.status)}</td>
                  <td>{template.language.toUpperCase()}</td>
                  <td>{new Date(template.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 8px', fontSize: '12px' }}
                        onClick={() => handleView(template)}
                        title="View"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ padding: '6px 8px', fontSize: '12px' }}
                        onClick={() => handleEdit(template)}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '6px 8px', fontSize: '12px' }}
                        onClick={() => handleDelete(template._id)}
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
        <TemplateModal
          template={editingTemplate}
          viewing={viewingTemplate}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};

export default Templates;
