import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Building2, Shield, Lock, Eye, EyeOff,
  CheckCircle2, AlertCircle, ArrowLeft, Camera, Save, Loader2,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    company: user?.company || '',
  });
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }
  const [errors, setErrors] = useState({});

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const set = field => e => setForm(p => ({ ...p, [field]: e.target.value }));
  const setPw = field => e => setPwForm(p => ({ ...p, [field]: e.target.value }));

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.name.trim().length < 2) {
      setErrors({ name: 'Name must be at least 2 characters' });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await updateProfile({ name: form.name.trim(), company: form.company.trim() });
      showToast('success', 'Profile updated successfully!');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwForm.currentPassword) errs.currentPassword = 'Required';
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) errs.newPassword = 'At least 6 characters';
    if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setPwLoading(true);
    try {
      await updateProfile({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      showToast('success', 'Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const pwStrength = (() => {
    const p = pwForm.newPassword;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][pwStrength] || '';
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-emerald-400', 'bg-green-500'][pwStrength] || '';

  return (
    <div className="min-h-screen bg-surface">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold animate-slide-up
          ${toast.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-9 h-9 bg-white border border-stone-200 rounded-xl flex items-center justify-center hover:border-amber-300 hover:bg-amber-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-stone-600" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-800 text-stone-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Edit Profile</h1>
            <p className="text-stone-400 text-sm">Manage your account information and security</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Avatar card */}
          <div className="animate-slide-up">
            <div className="card-sems p-6 text-center">
              {/* Avatar */}
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg mx-auto"
                  style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {initials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border-2 border-stone-100 rounded-full flex items-center justify-center shadow-sm">
                  <Camera className="w-3.5 h-3.5 text-stone-400" />
                </div>
              </div>

              <h2 className="font-display font-700 text-stone-900 text-lg mb-0.5" style={{ fontFamily: 'Outfit, sans-serif' }}>{user?.name}</h2>
              <p className="text-stone-400 text-sm">{user?.email}</p>
              {user?.company && <p className="text-amber-600 text-xs font-medium mt-1">{user.company}</p>}

              {/* Role badge */}
              <div className="mt-4 inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                <Shield className="w-3 h-3" />
                {user?.role || 'operator'}
              </div>

              {/* Account info */}
              <div className="mt-6 pt-4 border-t border-stone-100 space-y-2 text-left">
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{user?.company || 'No company set'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="capitalize">{user?.role}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Forms */}
          <div className="lg:col-span-2 space-y-5 animate-slide-up stagger-2">
            {/* Profile Info Form */}
            <div className="card-sems p-6">
              <div className="flex items-center gap-2 mb-5">
                <User className="w-4 h-4 text-amber-500" />
                <h3 className="font-display font-700 text-stone-900 text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>Personal Information</h3>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="Your full name"
                    className={`input-field ${errors.name ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="input-field bg-stone-50 text-stone-400 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">Company / Organization</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={set('company')}
                    placeholder="Your company name (optional)"
                    className="input-field"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="card-sems p-6">
              <div className="flex items-center gap-2 mb-5">
                <Lock className="w-4 h-4 text-amber-500" />
                <h3 className="font-display font-700 text-stone-900 text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>Change Password</h3>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">Current Password *</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={pwForm.currentPassword}
                      onChange={setPw('currentPassword')}
                      placeholder="••••••••"
                      className={`input-field pr-10 ${errors.currentPassword ? 'border-red-300' : ''}`}
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && <p className="text-xs text-red-500 mt-1">{errors.currentPassword}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">New Password *</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={pwForm.newPassword}
                      onChange={setPw('newPassword')}
                      placeholder="••••••••"
                      className={`input-field pr-10 ${errors.newPassword ? 'border-red-300' : ''}`}
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>}

                  {/* Strength meter */}
                  {pwForm.newPassword && (
                    <div className="mt-2">
                      <div className="flex gap-1 h-1.5 mb-1">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${i <= pwStrength ? strengthColor : 'bg-stone-100'}`} />
                        ))}
                      </div>
                      <p className="text-[10px] text-stone-400">{strengthLabel}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">Confirm New Password *</label>
                  <input
                    type="password"
                    value={pwForm.confirmPassword}
                    onChange={setPw('confirmPassword')}
                    placeholder="••••••••"
                    className={`input-field ${errors.confirmPassword ? 'border-red-300' : ''}`}
                  />
                  {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                  {pwForm.newPassword && pwForm.confirmPassword && pwForm.newPassword === pwForm.confirmPassword && (
                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Passwords match
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="btn-primary flex items-center gap-2"
                  >
                    {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    {pwLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>

            {/* Account danger zone */}
            <div className="card-sems p-6 border-red-100">
              <h3 className="font-display font-700 text-stone-700 text-sm mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Account Details</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: 'Account Role', val: user?.role || '—', icon: Shield },
                  { label: 'Account ID', val: user?.id?.slice(-8) || '—', icon: User },
                ].map(({ label, val, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3 bg-stone-50 border border-stone-100 rounded-xl px-4 py-3">
                    <div className="w-8 h-8 bg-white border border-stone-200 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-stone-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-stone-400 uppercase tracking-wide">{label}</p>
                      <p className="text-sm font-semibold text-stone-700 font-mono" style={{ fontFamily: 'Fira Code, monospace' }}>{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
