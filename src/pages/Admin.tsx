import React from "react";
import { motion } from "motion/react";
import {
  Clock3,
  Calendar,
  CheckCircle,
  XCircle
} from "lucide-react";

import { Reservation, User } from "../types";

interface AdminProps {
  user: User;
  reservations: Reservation[];
  updateReservationStatus: (id: number, status: string) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

const Admin: React.FC<AdminProps> = ({
  user,
  reservations,
  updateReservationStatus,
  getStatusColor,
  getStatusIcon
}) => {
  return (
    <motion.div
      key="admin"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">
            Admin Dashboard
          </h2>
          <p className="text-black/50">
            Manage community requests and facilities
          </p>
        </div>

        <div className="px-6 py-3 bg-white rounded-2xl border border-black/5 text-sm font-bold flex items-center gap-2">
          <Clock3 className="w-5 h-5 text-amber-500" />
          {reservations.filter(r => r.status === "pending").length} Pending
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/5 text-xs font-bold uppercase tracking-widest text-black/40">
                <th className="px-8 py-6">Resident</th>
                <th className="px-8 py-6">Facility</th>
                <th className="px-8 py-6">Schedule</th>
                <th className="px-8 py-6">Purpose</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-black/5">
              {reservations.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-black/[0.02] transition-colors"
                >
                  <td className="px-8 py-6 font-bold">
                    {r.user_name}
                  </td>

                  <td className="px-8 py-6 font-medium">
                    {r.facility_name}
                  </td>

                  <td className="px-8 py-6">
                    <div className="text-sm font-medium">
                      {new Date(r.start_time).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-black/40">
                      {new Date(r.start_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}{" "}
                      -
                      {" "}
                      {new Date(r.end_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <div
                      className="text-sm text-black/60 max-w-xs truncate"
                      title={r.purpose}
                    >
                      {r.purpose}
                    </div>
                  </td>

                  <td className="px-8 py-6">
                    <div
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1.5 ${getStatusColor(
                        r.status
                      )}`}
                    >
                      {getStatusIcon(r.status)}
                      {r.status.toUpperCase()}
                    </div>
                  </td>

                  <td className="px-8 py-6 text-right">
                    {r.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            updateReservationStatus(r.id, "approved")
                          }
                          className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all"
                          title="Approve"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() =>
                            updateReservationStatus(r.id, "rejected")
                          }
                          className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reservations.length === 0 && (
          <div className="p-20 text-center">
            <Calendar className="w-12 h-12 text-black/10 mx-auto mb-4" />
            <p className="text-black/40 font-medium">
              No reservation requests found.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Admin;