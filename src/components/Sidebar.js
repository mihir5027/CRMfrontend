import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, 
  FaFileAlt, 
  FaDatabase, 
  FaPaperPlane,
  FaSignOutAlt,
  FaUser,
  FaCog
} from 'react-icons/fa';
import Logo from './Logo';

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-900 via-grey-800 to-blue-900 shadow-2xl z-50">
      {/* Logo Header */}
      <div className="p-6 border-b border-blue-700">
        <div className="flex justify-center">
          <Logo size="large" variant="dark" />
        </div>
        <p className="text-center text-blue-200 text-sm mt-2 font-medium">
          WhatsApp CRM
        </p>
      </div>
      
      {/* Navigation Menu */}
      <nav className="mt-6 px-4">
        <div className="space-y-2">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`
            }
          >
            <FaHome className="mr-3 text-lg" />
            Dashboard
          </NavLink>
          
          <NavLink 
            to="/templates" 
            className={({ isActive }) => 
              `flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`
            }
          >
            <FaFileAlt className="mr-3 text-lg" />
            Templates
          </NavLink>
          
          <NavLink 
            to="/data" 
            className={({ isActive }) => 
              `flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`
            }
          >
            <FaDatabase className="mr-3 text-lg" />
            Data Management
          </NavLink>

          <NavLink 
            to="/campaigns" 
            className={({ isActive }) => 
              `flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`
            }
          >
            <FaPaperPlane className="mr-3 text-lg" />
            Campaigns
          </NavLink>

          <button className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white transition-all duration-200">
            <FaCog className="mr-3 text-lg" />
            Settings
          </button>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-700 bg-blue-800">
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
            <FaUser className="text-white text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {user?.name || 'User'}
            </div>
            <div className="text-xs text-blue-200 truncate">
              {user?.email || 'user@example.com'}
            </div>
          </div>
        </div>
        <button 
          onClick={logout} 
          className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-lg"
        >
          <FaSignOutAlt className="mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
