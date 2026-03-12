import React from 'react';
import { motion } from 'motion/react';
import { XCircle } from 'lucide-react';
import { Reservation, Facility } from '../types';

interface EditReservationProps {
  reservation: Reservation;
  setReservation: React.Dispatch<React.SetStateAction<Reservation | null>>;
  facilities: Facility[];
  updateReservation: (id: number, updatedData: Partial<Reservation>) => Promise<void>;
  loading: boolean;
  error: string;
  cancelEdit: () => void;
}

const EditReservation: React.FC<EditReservationProps> = ({
  reservation,
  setReservation,
  facilities,
  updateReservation,
  loading,
  error,
  cancelEdit,
}) => {

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateReservation(reservation.id, {
      facility_id: reservation.facility_id,
      start_time: reservation.start_time,
      end_time: reservation.end_time,
      purpose: reservation.purpose,
    });
    cancelEdit();
  };

  return (
    <motion.div
      key="edit-reservation"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-6xl mx-auto bg-white p-10 rounded-[2.5rem] border border-black/5 shadow-2xl"
    >
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Modify Reservation</h2>
        <p className="text-black/50">Update the details of the booking</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-[0.85fr_1.5fr_0.65fr] gap-8">

        {/* 1 */}
        <div className="space-y-6">
            <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-black/40 ml-1">
                Facility
            </label>
            <select
                required
                className="w-full px-5 py-4 bg-black/5 rounded-2xl focus:ring-2 focus:ring-black"
                value={reservation.facility_id}
                onChange={e =>
                setReservation(prev => prev ? { ...prev, facility_id: Number(e.target.value) } : prev)
                }
            >
                <option value="">Select a facility</option>
                {facilities.map(f => (
                <option key={f.id} value={f.id}>
                    {f.name}
                </option>
                ))}
            </select>
            </div>

            <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-black/40 ml-1">
                Start Time
            </label>
            <input
                type="datetime-local"
                required
                className="w-full px-5 py-4 bg-black/5 rounded-2xl focus:ring-2 focus:ring-black"
                value={reservation.start_time}
                onChange={e =>
                setReservation(prev => prev ? { ...prev, start_time: e.target.value } : prev)
                }
            />
            </div>

            <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-black/40 ml-1">
                End Time
            </label>
            <input
                type="datetime-local"
                required
                className="w-full px-5 py-4 bg-black/5 rounded-2xl focus:ring-2 focus:ring-black"
                value={reservation.end_time}
                onChange={e =>
                setReservation(prev => prev ? { ...prev, end_time: e.target.value } : prev)
                }
            />
            </div>

        </div>

        {/* 2 */}
        <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-black/40 ml-1">
            Purpose
            </label>

            <textarea
            required
            className="w-full h-full min-h-[220px] px-5 py-4 bg-black/5 rounded-2xl focus:ring-2 focus:ring-black"
            value={reservation.purpose}
            onChange={e =>
                setReservation(prev => prev ? { ...prev, purpose: e.target.value } : prev)
            }
            />
        </div>

        {/* 3 */}
        <div className="flex flex-col justify-end gap-4">

            {error && (
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-medium flex items-center gap-2">
                <XCircle className="w-4 h-4" /> {error}
            </div>
            )}

            <button
            disabled={loading}
            className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-black/80 transition-all disabled:opacity-50 shadow-xl shadow-black/10"
            >
            {loading ? "Saving..." : "Update"}
            </button>

            <button
            type="button"
            onClick={cancelEdit}
            className="w-full py-4 bg-black/5 text-black rounded-2xl font-bold hover:bg-black/10 transition-all"
            >
            Cancel
            </button>

        </div>

        </form>
    </motion.div>
  );
};

export default EditReservation;