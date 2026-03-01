import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, LayoutDashboard, LogOut, Menu, X, User, ChevronDown, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
    setProfileOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (path) =>
    path === '/dashboard'
      ? location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/metric')
      : location.pathname === path;

  const linkClass = (path) =>
    `nav-link ${isActive(path) ? 'text-amber-600 font-semibold' : ''}`;

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shadow-md group-hover:bg-amber-600 transition-colors">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-display font-800 text-lg text-stone-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>SEMS</span>
              <span className="hidden sm:block text-[10px] text-stone-400 -mt-0.5 block leading-none">Smart Energy Management</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={linkClass('/')}>Home</Link>
            <Link to="/about" className={linkClass('/about')}>About</Link>

            {user ? (
              <>
                <Link to="/dashboard" className={`flex items-center gap-1.5 nav-link ${isActive('/dashboard') ? 'text-amber-600 font-semibold' : ''}`}>
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                {/* Profile dropdown */}
                <div className="relative ml-2 pl-4 border-l border-stone-200" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 group"
                  >
                    {/* Avatar circle */}
                    <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover:bg-amber-600 transition-colors">
                      {initials}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-stone-800 leading-none">{user.name}</p>
                      <p className="text-[10px] text-stone-400 capitalize leading-none mt-0.5">{user.role}</p>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-stone-100 rounded-2xl shadow-xl py-2 animate-fade-in z-50">
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-stone-100 mb-1">
                        <p className="text-sm font-semibold text-stone-900">{user.name}</p>
                        <p className="text-xs text-stone-400 truncate">{user.email}</p>
                        {user.company && <p className="text-xs text-amber-600 mt-0.5">{user.company}</p>}
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Edit Profile
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={linkClass('/login')}>Login</Link>
                <Link to="/signup" className="btn-primary text-sm py-2 px-5">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-amber-50"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-amber-100 px-4 py-4 space-y-1 animate-fade-in">
          <Link to="/" className="block py-2.5 px-3 rounded-xl nav-link hover:bg-amber-50" onClick={() => setMobileOpen(false)}>Home</Link>
          <Link to="/about" className="block py-2.5 px-3 rounded-xl nav-link hover:bg-amber-50" onClick={() => setMobileOpen(false)}>About</Link>

          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-2 py-2.5 px-3 rounded-xl nav-link hover:bg-amber-50" onClick={() => setMobileOpen(false)}>
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link to="/profile" className="flex items-center gap-2 py-2.5 px-3 rounded-xl nav-link hover:bg-amber-50" onClick={() => setMobileOpen(false)}>
                <Settings className="w-4 h-4" />
                Edit Profile
              </Link>
              <div className="pt-2 mt-2 border-t border-stone-100">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{initials}</div>
                  <div>
                    <p className="text-sm font-semibold text-stone-800">{user.name}</p>
                    <p className="text-xs text-stone-400">{user.email}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-medium text-sm px-3 py-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-stone-100">
              <Link to="/login" className="btn-secondary text-center text-sm" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/signup" className="btn-primary text-center text-sm" onClick={() => setMobileOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
