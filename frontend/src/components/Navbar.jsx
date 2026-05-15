import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setMobileOpen(false)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive(to)
          ? 'text-primary-400 bg-primary-500/10'
          : 'text-dark-300 hover:text-white hover:bg-dark-800'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white font-bold text-sm group-hover:shadow-lg group-hover:shadow-primary-500/25 transition-all">
              A
            </div>
            <span className="text-lg font-bold text-white">
              ATS<span className="text-primary-400">Analyzer</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLink('/', 'Home')}
            {isAuthenticated && (
              <>
                {navLink('/upload', 'Analyze')}
                {navLink('/dashboard', 'Dashboard')}
              </>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-dark-400">
                  Hi, <span className="text-primary-300 font-medium">{user?.name}</span>
                </span>
                <button onClick={handleLogout} className="btn-outline text-sm !px-4 !py-2">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline text-sm !px-4 !py-2">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary text-sm !px-4 !py-2">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-dark-900/95 backdrop-blur-xl border-b border-dark-800 animate-slide-down">
          <div className="px-4 py-4 flex flex-col gap-2">
            {navLink('/', 'Home')}
            {isAuthenticated ? (
              <>
                {navLink('/upload', 'Analyze')}
                {navLink('/dashboard', 'Dashboard')}
                <button
                  onClick={handleLogout}
                  className="text-left px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {navLink('/login', 'Login')}
                {navLink('/signup', 'Sign Up')}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
