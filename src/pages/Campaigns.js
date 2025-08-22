import React, { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaEye, FaEdit, FaTrash, FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  const fetchAll = async () => {
    try {
      const [cRes, tRes, dRes] = await Promise.all([
        axios.get('/api/campaigns'),
        axios.get('/api/templates'),
        axios.get('/api/data')
      ]);
      setCampaigns(cRes.data);
      setTemplates(tRes.data);
      setContacts(dRes.data);
    } catch (e) {
      toast.error('Failed to load campaigns');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreate = () => {
    setEditing(null);
    setViewing(null);
    setShowModal(true);
  };

  const handleEdit = (c) => {
    setEditing(c);
    setViewing(null);
    setShowModal(true);
  };

  const handleView = (c) => {
    setViewing(c);
    setEditing(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await axios.delete(`/api/campaigns/${id}`);
      toast.success('Campaign deleted');
      fetchAll();
    } catch (e) {
      toast.error('Failed to delete campaign');
    }
  };

  const getStatusBadge = (status) => {
    const colors = { draft: '#6c757d', scheduled: '#17a2b8', sent: '#25d366' };
    return (
      <span style={{ padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 500, background: `${colors[status]}20`, color: colors[status] }}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) return <div className="loading">Loading campaigns...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Campaigns</h1>
        <button className="btn btn-primary" onClick={handleCreate}>
          <FaPlus style={{ marginRight: 8 }} />
          New Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📨</div>
          <h3>No campaigns yet</h3>
          <p>Create your first campaign to start messaging your contacts</p>
          <button className="btn btn-primary" onClick={handleCreate} style={{ marginTop: 20 }}>
            <FaPlus style={{ marginRight: 8 }} />
            New Campaign
          </button>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Template</th>
                <th>Recipients</th>
                <th>Status</th>
                <th>Scheduled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c._id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.template?.name || '-'}</td>
                  <td>{c.recipients?.length || 0}</td>
                  <td>{getStatusBadge(c.status)}</td>
                  <td>{c.scheduledAt ? new Date(c.scheduledAt).toLocaleString() : '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary" style={{ padding: '6px 8px', fontSize: 12 }} onClick={() => handleView(c)} title="View"><FaEye /></button>
                      <button className="btn btn-primary" style={{ padding: '6px 8px', fontSize: 12 }} onClick={() => handleEdit(c)} title="Edit"><FaEdit /></button>
                      <button className="btn btn-danger" style={{ padding: '6px 8px', fontSize: 12 }} onClick={() => handleDelete(c._id)} title="Delete"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <CampaignModal
          onClose={() => { setShowModal(false); setEditing(null); setViewing(null); }}
          onSaved={() => { fetchAll(); setShowModal(false); setEditing(null); setViewing(null); }}
          templates={templates}
          contacts={contacts}
          editing={editing}
          viewing={viewing}
        />
      )}
    </div>
  );
};

const CampaignModal = ({ onClose, onSaved, templates, contacts, editing, viewing }) => {
  const isView = !!viewing;
  const initial = useMemo(() => ({
    name: editing?.name || viewing?.name || '',
    templateId: editing?.template?._id || viewing?.template?._id || (templates[0]?._id || ''),
    recipientIds: (editing?.recipients || viewing?.recipients || []).map(r => r._id),
    variableMappings: editing?.variableMappings || viewing?.variableMappings || [],
    scheduledAt: editing?.scheduledAt ? new Date(editing.scheduledAt).toISOString().slice(0,16) : ''
  }), [editing, viewing, templates]);

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(initial); }, [initial]);

  const selectedTemplate = useMemo(() => templates.find(t => t._id === form.templateId), [templates, form.templateId]);

  const setField = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

  const ensureVariableMappings = () => {
    if (!selectedTemplate) return [];
    const existing = new Map((form.variableMappings || []).map(v => [v.variableName, v]));
    return (selectedTemplate.variables || []).map(v => existing.get(v.name) || { variableName: v.name, type: 'field', value: 'name' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.templateId) { toast.error('Name and template are required'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        templateId: form.templateId,
        recipientIds: form.recipientIds,
        variableMappings: ensureVariableMappings(),
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined
      };
      if (editing) {
        await axios.put(`/api/campaigns/${editing._id}`, payload);
        toast.success('Campaign updated');
      } else {
        await axios.post('/api/campaigns', payload);
        toast.success('Campaign created');
      }
      onSaved();
    } catch (e) {
      toast.error('Failed to save campaign');
      console.error(e);
    } finally { setSaving(false); }
  };

  const toggleRecipient = (id) => {
    setForm(prev => ({
      ...prev,
      recipientIds: prev.recipientIds.includes(id)
        ? prev.recipientIds.filter(r => r !== id)
        : [...prev.recipientIds, id]
    }));
  };

  const toggleSelectAll = () => {
    setForm(prev => ({
      ...prev,
      recipientIds: prev.recipientIds.length === contacts.length 
        ? [] 
        : contacts.map(c => c._id)
    }));
  };

  const vars = ensureVariableMappings();

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{isView ? 'View Campaign' : editing ? 'Edit Campaign' : 'New Campaign'}</h2>
          <button className="close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Campaign Name *</label>
            <input className="form-control" value={form.name} onChange={e => setField('name', e.target.value)} disabled={isView} placeholder="Enter campaign name" />
          </div>

          <div className="form-group">
            <label>Template *</label>
            <select className="form-control" value={form.templateId} onChange={e => setField('templateId', e.target.value)} disabled={isView}>
              {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            {selectedTemplate && (
              <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
                Using template: <strong>{selectedTemplate.name}</strong>
              </div>
            )}
          </div>

          {selectedTemplate && selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
            <div className="form-group">
              <label>Variable Mappings</label>
              {vars.map((v, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ width: 160, fontSize: 14 }}>{`{{${v.variableName}}}`}</div>
                  <select className="form-control" style={{ maxWidth: 140 }} value={v.type} disabled={isView}
                          onChange={e => setField('variableMappings', vars.map((x,i)=> i===idx? { ...x, type: e.target.value } : x))}>
                    <option value="field">Contact Field</option>
                    <option value="static">Static Text</option>
                  </select>
                  {v.type === 'field' ? (
                    <select className="form-control" style={{ maxWidth: 200 }} value={v.value} disabled={isView}
                            onChange={e => setField('variableMappings', vars.map((x,i)=> i===idx? { ...x, value: e.target.value } : x))}>
                      <option value="name">Name</option>
                      <option value="phone">Phone</option>
                      <option value="email">Email</option>
                      <option value="category">Category</option>
                    </select>
                  ) : (
                    <input className="form-control" placeholder="Enter text" value={v.value} disabled={isView}
                           onChange={e => setField('variableMappings', vars.map((x,i)=> i===idx? { ...x, value: e.target.value } : x))} />
                  )}
                </div>
              ))}
            </div>
          )}



          <div className="form-group">
            <label>Recipients (optional)</label>
            <div style={{ maxHeight: 160, overflow: 'auto', border: '1px solid #eee', borderRadius: 4, padding: 8 }}>
              {/* Select All Checkbox */}
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: '1px solid #eee', marginBottom: '8px', fontWeight: 'bold' }}>
                <input type="checkbox" disabled={isView}
                       checked={form.recipientIds.length === contacts.length && contacts.length > 0}
                       onChange={toggleSelectAll} />
                <span style={{ fontSize: 14, color: '#2563EB' }}>
                  Select All ({contacts.length} contacts)
                </span>
              </label>
              
              {/* Individual Contact Checkboxes */}
              {contacts.map(c => (
                <label key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                  <input type="checkbox" disabled={isView}
                         checked={form.recipientIds.includes(c._id)}
                         onChange={() => toggleRecipient(c._id)} />
                  <span style={{ fontSize: 14 }}>
                    <strong>{c.name}</strong> <span style={{ color: '#666' }}>({c.phone})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Schedule (optional)</label>
            <input type="datetime-local" className="form-control" value={form.scheduledAt} disabled={isView}
                   onChange={e => setField('scheduledAt', e.target.value)} />
          </div>

          {!isView ? (
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <FaPaperPlane style={{ marginRight: 6 }} /> {saving ? 'Saving...' : (editing ? 'Update Campaign' : 'Create Campaign')}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn btn-primary" onClick={onClose}>Close</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Campaigns;





