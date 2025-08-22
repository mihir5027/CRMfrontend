import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const DataModal = ({ data, viewing, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: 'customer',
    status: 'active',
    tags: [],
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name,
        phone: data.phone,
        email: data.email || '',
        category: data.category,
        status: data.status,
        tags: data.tags || [],
        notes: data.notes || ''
      });
    } else if (viewing) {
      setFormData({
        name: viewing.name,
        phone: viewing.phone,
        email: viewing.email || '',
        category: viewing.category,
        status: viewing.status,
        tags: viewing.tags || [],
        notes: viewing.notes || ''
      });
    }
  }, [data, viewing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }

    setLoading(true);
    try {
      if (data) {
        await axios.put(`/api/data/${data._id}`, formData);
        toast.success('Contact updated successfully');
      } else {
        await axios.post('/api/data', formData);
        toast.success('Contact created successfully');
      }
      onSave();
    } catch (error) {
      toast.error(data ? 'Failed to update contact' : 'Failed to create contact');
      console.error('Error saving data:', error);
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
            {isViewMode ? 'View Contact' : data ? 'Edit Contact' : 'Add Contact'}
          </h2>
          <button className="close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isViewMode}
              placeholder="Enter contact name"
            />
          </div>

          <div className="form-group">
            <label>Phone *</label>
            <input
              type="tel"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={isViewMode}
              placeholder="Enter phone number"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isViewMode}
              placeholder="Enter email address"
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
              <option value="customer">Customer</option>
              <option value="lead">Lead</option>
              <option value="prospect">Prospect</option>
              <option value="vendor">Vendor</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
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
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                className="form-control"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                disabled={isViewMode}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              {!isViewMode && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addTag}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Add
                </button>
              )}
            </div>
            {formData.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#25d366',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    {tag}
                    {!isViewMode && (
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '14px',
                          padding: '0'
                        }}
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              className="form-control"
              value={formData.notes}
              onChange={handleInputChange}
              disabled={isViewMode}
              placeholder="Add notes about this contact..."
              rows="3"
            />
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
                {loading ? 'Saving...' : data ? 'Update Contact' : 'Add Contact'}
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

export default DataModal;
