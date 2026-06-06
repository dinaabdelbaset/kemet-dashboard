// @ts-nocheck
import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import {
  Trash2, Edit, X, Search, Filter, RefreshCw,
  CheckCircle, XCircle, Clock, Ticket, TrendingUp,
  DollarSign, Users, BarChart2, ChevronDown, Eye, Calendar
} from "lucide-react";

const STATUS_COLORS = {
  confirmed: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", label: "Confirmed" },
  pending:   { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500",   label: "Pending"   },
  cancelled: { bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-500",     label: "Cancelled" },
};

const TYPE_ICONS: Record<string, string> = {
  hotel: "🏨", tour: "🗺️", safari: "🦁", flight: "✈️",
  museum: "🏛️", restaurant: "🍽️", transport: "🚗",
  event: "🎉", package: "📦", food: "🍔", default: "🎟️"
};

function getTypeIcon(type: string) {
  const lower = (type || "").toLowerCase();
  for (const key of Object.keys(TYPE_ICONS)) {
    if (lower.includes(key)) return TYPE_ICONS[key];
  }
  return TYPE_ICONS.default;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [formData, setFormData] = useState<any>({ id: null, status: "pending" });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/admin/bookings");
      setBookings(res.data);
    } catch {
      setError("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const openEditModal = (booking: any) => {
    setFormData({ id: booking.id, status: booking.status, notes: booking.notes || "" });
    setIsModalOpen(true);
  };

  const openViewModal = (booking: any) => {
    setSelectedBooking(booking);
    setViewModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setViewModalOpen(false); };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axiosClient.put(`/admin/bookings/${formData.id}`, { status: formData.status, notes: formData.notes });
      closeModal();
      fetchBookings();
    } catch {
      alert("Error updating booking!");
    } finally {
      setSaving(false);
    }
  };

  const deleteBooking = async (id: number) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
      await axiosClient.delete(`/admin/bookings/${id}`);
      fetchBookings();
    } catch {
      alert("Failed to delete booking.");
    }
  };

  // Stats
  const totalRevenue = bookings.filter(b => b.status !== "cancelled").reduce((s, b) => s + parseFloat(b.total_price || 0), 0);
  const totalProfit  = bookings.filter(b => b.status !== "cancelled").reduce((s, b) => s + parseFloat(b.platform_profit || 0), 0);
  const confirmedCount = bookings.filter(b => b.status === "confirmed").length;
  const pendingCount   = bookings.filter(b => b.status === "pending").length;
  const cancelledCount = bookings.filter(b => b.status === "cancelled").length;

  // Filters
  const types = ["all", ...Array.from(new Set(bookings.map(b => (b.booking_type || b.item_type || "").split("_")[0]).filter(Boolean)))];
  const filtered = bookings.filter(b => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || (b.user?.first_name || "Guest").toLowerCase().includes(q)
      || (b.item_title || "").toLowerCase().includes(q)
      || String(b.id).includes(q)
      || (b.booking_type || b.item_type || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchType = typeFilter === "all" || (b.booking_type || b.item_type || "").toLowerCase().includes(typeFilter);
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Ticket className="text-amber-500" size={26} /> Bookings Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">Monitor and manage all platform bookings</p>
        </div>
        <button onClick={fetchBookings} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all text-sm">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><DollarSign size={18} className="text-amber-500" /><span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Revenue</span></div>
          <p className="text-2xl font-black text-slate-800">${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <p className="text-xs text-slate-400 mt-1">{bookings.filter(b => b.status !== "cancelled").length} active bookings</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={18} className="text-green-500" /><span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Profit</span></div>
          <p className="text-2xl font-black text-green-600">${totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <p className="text-xs text-slate-400 mt-1">Platform commission</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><CheckCircle size={18} className="text-emerald-500" /><span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Confirmed</span></div>
          <p className="text-2xl font-black text-emerald-600">{confirmedCount}</p>
          <p className="text-xs text-slate-400 mt-1">Active bookings</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><Clock size={18} className="text-amber-500" /><span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pending</span></div>
          <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
          <p className="text-xs text-slate-400 mt-1">Awaiting review</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><XCircle size={18} className="text-red-500" /><span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cancelled</span></div>
          <p className="text-2xl font-black text-red-500">{cancelledCount}</p>
          <p className="text-xs text-slate-400 mt-1">Cancelled bookings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by user, title, ID or type..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition"
            />
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 bg-white font-medium appearance-none cursor-pointer">
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <BarChart2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 bg-white font-medium appearance-none cursor-pointer">
              {types.map(t => <option key={t} value={t}>{t === "all" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        {searchQuery || statusFilter !== "all" || typeFilter !== "all" ? (
          <p className="text-xs text-slate-500 mt-2 font-medium">Showing <span className="font-bold text-amber-600">{filtered.length}</span> of {bookings.length} bookings</p>
        ) : null}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 gap-3 text-slate-400">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            Loading bookings...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">Booking</th>
                  <th className="px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">Service</th>
                  <th className="px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">Profit</th>
                  <th className="px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(b => {
                  const sc = STATUS_COLORS[b.status] || STATUS_COLORS.pending;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-5 py-4">
                        <span className="text-xs font-black text-slate-400 font-mono">#{b.id}</span>
                        {b.date_info && <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5"><Calendar size={10}/> {b.date_info}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {(b.user?.first_name || b.user?.name || "G")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{b.user?.first_name || b.user?.name || "Guest"}</p>
                            <p className="text-[11px] text-slate-400">{b.user?.email || ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                            <span>{getTypeIcon(b.booking_type || b.item_type)}</span>
                            <span className="max-w-[180px] truncate">{b.item_title || "—"}</span>
                          </p>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            {(b.booking_type || b.item_type || "—").replace(/_/g, " ")}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-800">${parseFloat(b.total_price || 0).toFixed(2)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <span className="font-bold text-green-600 text-sm">${parseFloat(b.platform_profit || 0).toFixed(2)}</span>
                          <p className="text-[11px] text-slate-400">{b.commission_percentage || "15%"} commission</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1.5">
                          <button onClick={() => openViewModal(b)} title="View Details"
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => openEditModal(b)} title="Edit Status"
                            className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => deleteBooking(b.id)} title="Delete"
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <Ticket size={40} className="mx-auto text-slate-200 mb-3" />
                      <p className="text-slate-400 font-semibold">No bookings found</p>
                      <p className="text-slate-300 text-sm">Try adjusting your filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <div>
                <h3 className="text-lg font-black text-slate-800">Update Booking #{formData.id}</h3>
                <p className="text-slate-500 text-sm">Change status or add notes</p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Booking Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {["confirmed", "pending", "cancelled"].map(s => (
                    <button key={s} type="button" onClick={() => setFormData({ ...formData, status: s })}
                      className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                        formData.status === s
                          ? s === "confirmed" ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : s === "cancelled" ? "border-red-500 bg-red-50 text-red-700"
                            : "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Admin Notes (optional)</label>
                <textarea rows={3} value={formData.notes || ""} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition resize-none"
                  placeholder="Add internal notes about this booking..."></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition text-sm">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition text-sm shadow-lg shadow-amber-200 disabled:opacity-60">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-gradient-to-r from-slate-800 to-slate-900">
              <div>
                <h3 className="text-lg font-black text-white">Booking #{selectedBooking.id}</h3>
                <p className="text-slate-400 text-sm">Full booking details</p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Customer</p>
                  <p className="font-bold text-slate-800">{selectedBooking.user?.first_name || selectedBooking.user?.name || "Guest"}</p>
                  <p className="text-xs text-slate-500">{selectedBooking.user?.email || "—"}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Status</p>
                  {(() => { const sc = STATUS_COLORS[selectedBooking.status] || STATUS_COLORS.pending; return (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}></span>{sc.label}
                    </span>
                  ); })()}
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Service</p>
                  <p className="font-bold text-slate-800">{getTypeIcon(selectedBooking.booking_type || selectedBooking.item_type)} {selectedBooking.item_title || "—"}</p>
                  <p className="text-xs text-slate-500 uppercase font-bold">{selectedBooking.booking_type || selectedBooking.item_type}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Date</p>
                  <p className="font-bold text-slate-800 text-sm">{selectedBooking.date_info || "—"}</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Total Price</p>
                  <p className="font-black text-slate-800 text-xl">${parseFloat(selectedBooking.total_price || 0).toFixed(2)}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Platform Profit</p>
                  <p className="font-black text-green-600 text-xl">${parseFloat(selectedBooking.platform_profit || 0).toFixed(2)}</p>
                  <p className="text-xs text-slate-400">{selectedBooking.commission_percentage || "15%"} commission</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Partner Share</p>
                <p className="font-bold text-slate-700">${parseFloat(selectedBooking.partner_share || 0).toFixed(2)}</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { closeModal(); openEditModal(selectedBooking); }}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition">
                  Edit Status
                </button>
                <button onClick={closeModal} className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold text-sm transition">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
