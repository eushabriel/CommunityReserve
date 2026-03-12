import React from "react";
import { motion } from "motion/react";
import {
  Calendar,
  Clock,
  CalendarDays,
  Building2,
  Plus,
  XCircle
} from "lucide-react";

import { Facility, Reservation, User } from "../types";

interface DashboardProps {
  user: User;
  reservations: Reservation[];
  facilities: Facility[];
  reservationForm: {
    facilityId: number;
    startTime: string;
    endTime: string;
    purpose: string;
  };
  setReservationForm: React.Dispatch<
    React.SetStateAction<{
      facilityId: number;
      startTime: string;
      endTime: string;
      purpose: string;
    }>
  >;
  handleReservation: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  reservations,
  facilities,
  reservationForm,
  setReservationForm,
  handleReservation,
  loading,
  error,
  getStatusColor,
  getStatusIcon
}) => {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-12"
    >
      {/* LEFT SIDE */}
      <div className="lg:col-span-2 space-y-12">
        <div className="flex justify-between items-center">
          <h2 className="text-4xl font-bold tracking-tight">
            Your Reservations
          </h2>

          <div className="px-4 py-2 bg-white rounded-2xl border border-black/5 text-sm font-bold flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-emerald-600" />
            {reservations.length} Bookings
          </div>
        </div>

        <div className="space-y-4">
          {reservations.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-[2rem] border border-dashed border-black/10">
              <Calendar className="w-12 h-12 text-black/10 mx-auto mb-4" />
              <p className="text-black/40 font-medium">
                No reservations yet. Start by booking a facility!
              </p>
            </div>
          ) : (
            reservations.map((r) => (
              <motion.div
                layout
                key={r.id}
                className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-black/5 rounded-2xl flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-black/20" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold">
                      {r.facility_name}
                    </h3>

                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-black/50 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(r.start_time).toLocaleDateString()}
                      </span>

                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {new Date(r.start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>

                    <p className="mt-2 text-sm italic text-black/40">
                      "{r.purpose}"
                    </p>
                  </div>
                </div>

                <div
                  className={`px-4 py-2 rounded-full text-xs font-bold border flex items-center gap-2 ${getStatusColor(
                    r.status
                  )}`}
                >
                  {getStatusIcon(r.status)}
                  {r.status.toUpperCase()}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 shadow-xl sticky top-24">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Plus className="w-6 h-6 text-emerald-600" />
            New Reservation
          </h3>

          <form onSubmit={handleReservation} className="space-y-5">
            <select
              required
              className="w-full px-5 py-4 bg-black/5 rounded-2xl"
              value={reservationForm.facilityId}
              onChange={(e) =>
                setReservationForm({
                  ...reservationForm,
                  facilityId: parseInt(e.target.value)
                })
              }
            >
              <option value={0}>Choose a space...</option>

              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            

            <div className="relative">
              <input
                type="datetime-local"
                required
                value={reservationForm.startTime}
                onChange={(e) =>
                  setReservationForm({ ...reservationForm, startTime: e.target.value })
                }
                className="peer w-full px-5 py-4 bg-black/5 rounded-2xl"
              />
              <label className="absolute left-5 -top-2 px-1 text-xs text-black/60 pointer-events-none peer-focus:hidden">
                Start Time
              </label>
            </div>

            <div className="relative">
              <input
                type="datetime-local"
                required
                value={reservationForm.startTime}
                onChange={(e) =>
                  setReservationForm({ ...reservationForm, endTime: e.target.value })
                }
                className="peer w-full px-5 py-4 bg-black/5 rounded-2xl"
              />
              <label className="absolute left-5 -top-2 px-1 text-xs text-black/60 pointer-events-none peer-focus:hidden">
                End Time
              </label>
            </div>

            <textarea
              required
              placeholder="Purpose of reservation"
              value={reservationForm.purpose}
              onChange={(e) => setReservationForm({ ...reservationForm, purpose: e.target.value })}
              className="w-full px-5 py-4 bg-black/5 rounded-2xl"
            />

            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              disabled={loading || reservationForm.facilityId === 0}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold"
            >
              {loading ? "Booking..." : "Submit Request"}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;