import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const TemplateModal = ({ template, viewing, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'marketing',
    content: '',
    variables: [],
    language: 'en',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        category: template.category,
        content: template.content,
        variables: template.variables || [],
        language: template.language,
        status: template.status
      });
    } else if (viewing) {
      setFormData({
        name: viewing.name,
        category: viewing.category,
        content: viewing.content,
        variables: viewing.variables || [],
        language: viewing.language,
        status: viewing.status
      });
    }
  }, [template, viewing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVariableChange = (index, field, value) => {
    const newVariables = [...formData.variables];
    newVariables[index] = {
      ...newVariables[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      variables: newVariables
    }));
  };

  const addVariable = () => {
    setFormData(prev => ({
      ...prev,
      variables: [...prev.variables, { name: '', description: '', required: false }]
    }));
  };

  const removeVariable = (index) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error('Name and content are required');
      return;
    }

    setLoading(true);
    try {
      if (template) {
        await axios.put(`/api/templates/${template._id}`, formData);
        toast.success('Template updated successfully');
      } else {
        await axios.post('/api/templates', formData);
        toast.success('Template created successfully');
      }
      onSave();
    } catch (error) {
      const msg = error?.response?.data?.message || (template ? 'Failed to update template' : 'Failed to create template');
      toast.error(msg);
      console.error('Error saving template:', error);
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = !!viewing;

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {isViewMode ? 'View Template' : template ? 'Edit Template' : 'Create Template'}
          </h2>
          <button className="close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Template Name *</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isViewMode}
              placeholder="Enter template name"
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              className="form-control"
              value={formData.category}
              onChange={handleInputChange}
              disabled={isViewMode}
            >
              <option value="marketing">Marketing</option>
              <option value="support">Support</option>
              <option value="notification">Notification</option>
              <option value="welcome">Welcome</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Content *</label>
            <textarea
              name="content"
              className="form-control"
              value={formData.content}
              onChange={handleInputChange}
              disabled={isViewMode}
              placeholder="Enter your message template content..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Language</label>
            <select
              name="language"
              className="form-control"
              value={formData.language}
              onChange={handleInputChange}
              disabled={isViewMode}
            >
              <option value="en">English</option>
              <option value="gu">Gujarati</option>
              <option value="hi">Hindi</option>
            </select>
          </div>

          {/* <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              className="form-control"
              value={formData.status}
              onChange={handleInputChange}
              disabled={isViewMode}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div> */}

          <div className="form-group">
            <label>Variables</label>
            {formData.variables.map((variable, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '10px',
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Variable name"
                  value={variable.name}
                  onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
                  disabled={isViewMode}
                  style={{ flex: 1 }}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Description"
                  value={variable.description}
                  onChange={(e) => handleVariableChange(index, 'description', e.target.value)}
                  disabled={isViewMode}
                  style={{ flex: 1 }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="checkbox"
                    checked={variable.required}
                    onChange={(e) => handleVariableChange(index, 'required', e.target.checked)}
                    disabled={isViewMode}
                  />
                  Required
                </label>
                {!isViewMode && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => removeVariable(index)}
                    style={{ padding: '6px 8px' }}
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
            {!isViewMode && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={addVariable}
                style={{ marginTop: '10px' }}
              >
                <FaPlus style={{ marginRight: '5px' }} />
                Add Variable
              </button>
            )}
          </div>

          {!isViewMode && (
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
              </button>
            </div>
          )}

          {isViewMode && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default TemplateModal;
