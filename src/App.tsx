import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock3, 
  LogOut, 
  Building2,
  Share2,
  Check
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { User, Facility, Reservation } from './types';

// import pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'login' | 'register' | 'dashboard' | 'admin'>('landing');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Form states
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [reservationForm, setReservationForm] = useState({ 
    facilityId: 0, 
    startTime: '', 
    endTime: '', 
    purpose: '' 
  });

  useEffect(() => {
    fetchFacilities();
  }, []);

  useEffect(() => {
    if (user) {
      fetchReservations();
    }
  }, [user]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchFacilities = async () => {
    const res = await fetch('/api/facilities');
    const data = await res.json();
    setFacilities(data);
  };

  const fetchReservations = async () => {
    if (!user) return;
    const res = await fetch(`/api/reservations?userId=${user.id}&role=${user.role}`);
    const data = await res.json();
    setReservations(data);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authForm.email, password: authForm.password })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setView(data.role === 'admin' ? 'admin' : 'dashboard');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setView('dashboard');
      } else {
        setError('Email already exists');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reservationForm, userId: user.id })
      });
      if (res.ok) {
        fetchReservations();
        setReservationForm({ facilityId: 0, startTime: '', endTime: '', purpose: '' });
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to book');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (id: number, status: string) => {
    await fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchReservations();
  };

  const logout = () => {
    setUser(null);
    setView('landing');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'rejected': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-amber-600 bg-amber-50 border-amber-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock3 className="w-4 h-4" />;
    }
  };

  return (

    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <Building2 className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">Community Reserve</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleShare}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              copied ? 'bg-emerald-500 text-white' : 'bg-black/5 hover:bg-black/10'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Share App'}
          </button>
          {user ? (
            <>
              <div className="flex items-center gap-3 px-4 py-2 bg-black/5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <button 
                onClick={logout}
                className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-full transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={() => setView('login')}
                className="px-6 py-2 text-sm font-medium hover:bg-black/5 rounded-full transition-all"
              >
                Sign In
              </button>
              <button 
                onClick={() => setView('register')}
                className="px-6 py-2 text-sm font-medium bg-black text-white rounded-full hover:bg-black/80 transition-all shadow-lg shadow-black/10"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </nav>


      {/* Main Content */}    
      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {view === 'landing' && <Landing setView={setView} />}

          {view === 'login' && (
            <Login
              key="login"
              authForm={{ email: authForm.email, password: authForm.password }}
              setAuthForm={(newState) =>
                setAuthForm((prev) => ({
                  ...prev,
                  ...newState
                }))
              }
              handleLogin={handleLogin}
              loading={loading}
              error={error}
              switchToRegister={() => setView('register')}
            />
          )}

          {view === 'register' && (
            <Register
              key="register"
              authForm={authForm}
              setAuthForm={setAuthForm}
              handleRegister={handleRegister}
              loading={loading}
              error={error}
              switchToLogin={() => setView('login')}
            />
          )}

          {view === 'dashboard' && user && (
          <Dashboard
            key="dashboard"
            user={user}
            reservations={reservations}
            facilities={facilities}
            reservationForm={reservationForm}
            setReservationForm={setReservationForm}
            handleReservation={handleReservation}
            loading={loading}
            error={error}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        )}

        {view === 'admin' && user?.role === 'admin' && (
          <Admin
            key="admin"
            user={user}
            reservations={reservations}
            updateReservationStatus={updateReservationStatus}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 py-12 px-6 mt-20 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Building2 className="text-white w-4 h-4" />
            </div>
            <span className="font-bold">Community Reserve</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-black/40">
            <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-black transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-black transition-colors">Contact Support</a>
          </div>
          <div className="text-sm text-black/30">
            © 2026 Bazaar City Community. Supporting SDG 11.
          </div>
        </div>
      </footer>
    </div>
    
  );
};

export default App;