import React, { useState, useEffect } from 'react';
import { FaFileAlt, FaDatabase, FaPaperPlane } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    templates: 0,
    data: 0,
    campaigns: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [templatesRes, dataRes, campaignsRes] = await Promise.all([
        axios.get('/api/templates'),
        axios.get('/api/data'),
        axios.get('/api/campaigns')
      ]);

      const templates = templatesRes.data;
      const data = dataRes.data;
      const campaigns = campaignsRes.data;

      setStats({
        templates: templates.length,
        data: data.length,
        campaigns: campaigns.length
      });
    } catch (error) {
      toast.error('Failed to fetch statistics');
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Noven Group
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            WhatsApp CRM Dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Templates</p>
                <p className="text-3xl font-bold text-gray-900">{stats.templates}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaFileAlt className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                <p className="text-3xl font-bold text-gray-900">{stats.data}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaDatabase className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{stats.campaigns}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FaPaperPlane className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Noven Group WhatsApp CRM
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed mb-6 text-center">
              This is your central hub for managing Noven Group WhatsApp templates and customer data. 
              Use the navigation menu to access different sections and streamline your communication workflow.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div 
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300"
                onClick={() => navigate('/templates')}
              >
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-500 rounded-lg mr-4">
                    <FaFileAlt className="text-white text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Templates</h3>
                </div>
                <p className="text-gray-700">
                  Create, edit, and manage your WhatsApp message templates with our intuitive interface.
                </p>
              </div>
              
              <div 
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300"
                onClick={() => navigate('/data')}
              >
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-500 rounded-lg mr-4">
                    <FaDatabase className="text-white text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Data Management</h3>
                </div>
                <p className="text-gray-700">
                  Manage your customer contacts and data efficiently with powerful tools and insights.
                </p>
              </div>

              <div 
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300"
                onClick={() => navigate('/campaigns')}
              >
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-purple-500 rounded-lg mr-4">
                    <FaPaperPlane className="text-white text-xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Campaigns</h3>
                </div>
                <p className="text-gray-700">
                  Launch and monitor WhatsApp campaigns with advanced targeting and analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
