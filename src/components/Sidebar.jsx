import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './ToastContainer';
import { Menu, X, Home, Settings, LogIn, LogOut, Copy, Check } from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);
  const { currentUser, isAuthorized, logout } = useAuth();
  const { showError, showSuccess } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth <= 768 && 
          sidebarRef.current && 
          !sidebarRef.current.contains(event.target) &&
          isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    }
  }, [location.pathname]);

  // Close sidebar when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  const handleLogin = () => {
    // Navigate to login page instead of logging in directly
    navigate('/login');
  };

  const handleLogout = async () => {
    try {
      await logout();
      showSuccess('Logged out successfully');
      // Redirect to login page after logout
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      showError('Failed to logout. Please try again.');
    }
  };

  const handleCopyUid = async () => {
    if (currentUser?.uid) {
      try {
        await navigator.clipboard.writeText(currentUser.uid);
        setCopiedUid(true);
        showSuccess('คัดลอก UID สำเร็จ');
        setTimeout(() => setCopiedUid(false), 2000);
      } catch (error) {
        console.error('Failed to copy UID:', error);
        showError('ไม่สามารถคัดลอก UID ได้');
      }
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Hamburger Menu Button (Mobile Only) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-slate-800 opacity-80 rounded-lg md:hidden button-hover shadow-lg"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-screen w-64 bg-slate-800 border-r border-slate-700
          flex flex-col transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold text-cyan-400 md:ml-0 ml-12">Smart Home</h1>
          <p className="text-sm text-slate-400 mt-1 md:ml-0 ml-12">Dashboard</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2" role="navigation" aria-label="Main navigation">
          <Link
            to="/dashboard"
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg link-hover
              ${isActive('/dashboard') 
                ? 'bg-cyan-600 text-white' 
                : 'text-slate-300 hover:bg-slate-700'
              }
            `}
            aria-current={isActive('/dashboard') ? 'page' : undefined}
          >
            <Home size={20} />
            <span>Dashboard</span>
          </Link>

          {/* Control link - only show for authorized users */}
          {currentUser && isAuthorized && (
            <Link
              to="/control"
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg link-hover
                ${isActive('/control') 
                  ? 'bg-cyan-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-700'
                }
              `}
              aria-current={isActive('/control') ? 'page' : undefined}
            >
              <Settings size={20} />
              <span>Control</span>
            </Link>
          )}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-700">
          {currentUser ? (
            <div className="space-y-3">
              {/* User Info */}
              <div className="flex items-start gap-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                    className="w-12 h-12 rounded-full"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.displayName || 'User')}&background=0ea5e9&color=fff`;
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold">
                    {currentUser.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {currentUser.displayName}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              {/* Authorization Badge */}
              <div className={`
                px-3 py-1.5 rounded-md text-xs font-medium text-center
                ${isAuthorized 
                  ? 'bg-green-900/50 text-green-400 border border-green-700' 
                  : 'bg-yellow-900/50 text-yellow-400 border border-yellow-700'
                }
              `}>
                {isAuthorized ? '✓ Authorized' : '⚠ Unauthorized'}
              </div>

              {/* User UID with Copy Button */}
              <div className="bg-slate-700/50 rounded-md p-2 border border-slate-600">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 mb-0.5">User ID</p>
                    <p className="text-xs text-slate-300 font-mono truncate">
                      {currentUser.uid}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyUid}
                    className="flex-shrink-0 p-1.5 hover:bg-slate-600 rounded button-hover"
                    title="Copy UID"
                    aria-label="Copy UID to clipboard"
                  >
                    {copiedUid ? (
                      <Check size={14} className="text-green-400" />
                    ) : (
                      <Copy size={14} className="text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                aria-label="Logout from account"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg button-hover text-sm"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            /* Login Button for Guests */
            <button
              onClick={handleLogin}
              aria-label="Login with Google"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg button-hover text-sm font-medium"
            >
              <LogIn size={16} />
              <span>Login</span>
            </button>
          )}
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
