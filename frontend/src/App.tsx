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
import EditReservation from './pages/EditReservation';

const App = () => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [view, setView] = useState<'landing' | 'login' | 'register' | 'dashboard' | 'admin' | 'edit'>('landing');
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const [isValidEmail, setValidEmail] = useState(false);
  const [isValidPassword, setValidPassword] = useState(false);

  // Form states
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [reservationForm, setReservationForm] = useState({ 
    facilityId: 0, 
    date: '',
    start_time: '', 
    end_time: '', 
    purpose: '' 
  });

  useEffect(() => {
    fetchFacilities();
  }, []);

  useEffect(() => {
    if (user) {
      setView(user.role === 'admin' ? 'admin' : 'dashboard');
      fetchReservations();
    } else {
      setView('landing');
    }
  }, [user]);

  useEffect(() => {
    validateEmail();
  }, [authForm.email]);

  useEffect(() => {
    validatePassword();
  }, [authForm.password]);

  const validateEmail = () => {
    const email = authForm.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setValidEmail(emailRegex.test(email));
  }

  const validatePassword = () => {
    const password = authForm.password;

    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const isValid = 
      password.length >= 8 && 
      hasUppercase && 
      hasNumber && 
      hasSymbol;

    setValidPassword(isValid);
  }

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
        localStorage.setItem('user', JSON.stringify(data));
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

    if (!isValidEmail) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!isValidPassword) {
      setError('Password does not meet the requirements.');
      return;
    }

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
        localStorage.setItem('user', JSON.stringify(data));
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
      const payload = {
        userId: user.id,
        facilityId: reservationForm.facilityId,
        date: reservationForm.date,
        start_time: reservationForm.start_time,
        end_time: reservationForm.end_time,
        purpose: reservationForm.purpose
      };
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchReservations();
        setReservationForm({ facilityId: 0, date: '', start_time: '', end_time: '', purpose: '' });
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
    try {
      const res = await fetch(`/api/updateReservation?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update reservation.');
        return;
      }

      fetchReservations();
    } catch (err) {
      setError('Connection error');
    }
  };

  const deleteReservation = async (id: number) => {
    try {
      const res = await fetch(`/api/reservations?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to delete reservation.');
        return;
      }

      fetchReservations();
    } catch (err) {
      setError('Connection error');
    }
  };

  const editReservation = async (id: number) => {
    try {
      const res = await fetch(`/api/reservations?id=${id}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to fetch reservation.');
        return;
      }

      const r = await res.json();

      const reservation: Reservation = {
        ...r,
        date: r.start_time.slice(0, 10),
        start_time: r.start_time.slice(11, 16),
        end_time: r.end_time.slice(11, 16)
      };

      setEditingReservation(reservation);
      setView('edit');

    } catch (err) {
      setError('Connection error');
    }
  };

  const updateReservation = async (id: number, updatedData: Partial<Reservation>) => {
    try {
      // console.log(updatedData);
      // return;
      // debug //

      const res = await fetch(`/api/reservations?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to update reservation.');
        return;
      }

      await fetchReservations();
      
      setEditingReservation(null);
      setView(user?.role === 'admin' ? 'admin' : 'dashboard');
    } catch (err) {
      setError('Connection error');
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
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
              isValidEmail={isValidEmail}
              isValidPassword={isValidPassword}
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
            deleteReservation={deleteReservation}
            editReservation={editReservation}
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
            deleteReservation={deleteReservation}
            editReservation={editReservation}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        )}

        {view === 'edit' && editingReservation && (
        <EditReservation
          key="edit"
          reservation={editingReservation}
          setReservation={setEditingReservation}
          facilities={facilities}
          updateReservation={updateReservation}
          loading={loading}
          error={error}
          cancelEdit={() => {
            setEditingReservation(null);
            setView(user?.role === 'admin' ? 'admin' : 'dashboard');
          }}
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