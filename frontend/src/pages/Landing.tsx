// pages/Landing.tsx
import { motion } from 'motion/react';
import { Calendar, ShieldCheck, LayoutDashboard, ChevronRight } from 'lucide-react';

interface LandingProps {
  setView: (view: 'landing' | 'login' | 'register' | 'dashboard' | 'admin') => void;
}

const features = [
  { icon: <Calendar className="w-8 h-8" />, title: "Instant Booking", desc: "Check availability and book in real-time without the paperwork." },
  { icon: <ShieldCheck className="w-8 h-8" />, title: "Secure & Fair", desc: "Transparent system ensures fair access for all community members." },
  { icon: <LayoutDashboard className="w-8 h-8" />, title: "Easy Management", desc: "Track all your reservations and history in one clean dashboard." }
];

const Landing: React.FC<LandingProps> = ({ setView }) => {
  return (
    <motion.div 
      key="landing"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-20"
    >
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <motion.h1 
          className="text-6xl md:text-7xl font-bold tracking-tighter leading-tight"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          Reserve Your Space, <span className="text-emerald-600 italic font-serif">Effortlessly.</span>
        </motion.h1>
        <p className="text-xl text-black/60 leading-relaxed">
          The modern reservation system for Bazaar City. Book community facilities, manage events, and stay organized with our centralized platform.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <button 
            onClick={() => setView('register')}
            className="px-8 py-4 bg-black text-white rounded-2xl font-semibold flex items-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-black/20"
          >
            Start Booking Now <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="p-8 bg-white rounded-3xl border border-black/5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-black/50 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Landing;