// @ts-nocheck
import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import {
  ShoppingCart, Search, Filter, RefreshCw, Eye, Edit, Trash2, X,
  CheckCircle, Clock, XCircle, PackageCheck, ChevronDown,
  DollarSign, TrendingUp, Package, User, MapPin, Phone,
  CalendarClock, CreditCard, AlertTriangle
} from "lucide-react";

const STATUS_STYLES: Record<string, any> = {
  Pending:   { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400",   icon: <Clock size={13} /> },
  Processing: { bg: "bg-blue-50",   text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-400",    icon: <PackageCheck size={13} /> },
  Delivered: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-400", icon: <CheckCircle size={13} /> },
  Cancelled: { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-400",     icon: <XCircle size={13} /> },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosClient.get("/admin/orders");
      setOrders(res.data);
    } catch (e: any) {
      if (e?.response?.status === 404) {
        setError("Orders API endpoint not found. Please check the backend routes.");
      } else {
        setError("Failed to load orders. " + (e?.response?.data?.message || ""));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleUpdateStatus = async (e: any) => {
    e.preventDefault();
    if (!editingOrder || !newStatus) return;
    setSaving(true);
    try {
      await axiosClient.put(`/admin/orders/${editingOrder.id}`, { status: newStatus });
      setEditingOrder(null);
      fetchOrders();
    } catch {
      alert("Failed to update order status.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    setDeleting(id);
    try {
      await axiosClient.delete(`/admin/orders/${id}`);
      fetchOrders();
    } catch {
      alert("Failed to delete order.");
    } finally {
      setDeleting(null);
    }
  };

  // Stats
  const totalRevenue = orders.filter(o => o.status !== "Cancelled").reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
  const pendingCount = orders.filter(o => o.status === "Pending").length;
  const deliveredCount = orders.filter(o => o.status === "Delivered").length;
  const cancelledCount = orders.filter(o => o.status === "Cancelled").length;

  // Filters
  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || String(o.id).includes(q)
      || (o.hotel_name || "").toLowerCase().includes(q)
      || (o.user?.name || o.user?.first_name || "").toLowerCase().includes(q)
      || (o.phone || "").includes(q);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <ShoppingCart className="text-amber-500" size={26} /> Orders Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">Track and manage all food & product orders</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all text-sm">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700">API Connection Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><DollarSign size={18} className="text-amber-500" /><span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Revenue</span></div>
          <p className="text-2xl font-black text-slate-800">${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          <p className="text-xs text-slate-400 mt-1">From {orders.filter(o => o.status !== "Cancelled").length} orders</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><Clock size={18} className="text-amber-500" /><span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pending</span></div>
          <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
          <p className="text-xs text-slate-400 mt-1">Waiting to be processed</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><CheckCircle size={18} className="text-emerald-500" /><span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Delivered</span></div>
          <p className="text-2xl font-black text-emerald-600">{deliveredCount}</p>
          <p className="text-xs text-slate-400 mt-1">Successfully delivered</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><XCircle size={18} className="text-red-500" /><span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cancelled</span></div>
          <p className="text-2xl font-black text-red-500">{cancelledCount}</p>
          <p className="text-xs text-slate-400 mt-1">Cancelled orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by ID, hotel, customer or phone..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition" />
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-amber-400 bg-white font-medium appearance-none cursor-pointer">
              <option value="all">All Statuses</option>
              {["Pending", "Processing", "Delivered", "Cancelled"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        {(search || statusFilter !== "all") && (
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Showing <span className="font-bold text-amber-600">{filtered.length}</span> of {orders.length} orders
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 gap-3 text-slate-400">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            Loading orders...
          </div>
        ) : filtered.length === 0 && !error ? (
          <div className="py-16 text-center">
            <ShoppingCart size={40} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400 font-semibold">No orders found</p>
            <p className="text-slate-300 text-sm">Orders placed from the frontend will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">Order</th>
                  <th className="px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">Delivery Info</th>
                  <th className="px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">Items</th>
                  <th className="px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">Payment</th>
                  <th className="px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(order => {
                  const s = STATUS_STYLES[order.status] || STATUS_STYLES.Pending;
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <span className="text-xs font-black text-slate-400 font-mono">#ORD-{order.id}</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {(order.user?.name || order.user?.first_name || "G")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{order.user?.name || order.user?.first_name || "Guest"}</p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1"><Phone size={9}/> {order.phone || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800 text-sm flex items-center gap-1"><MapPin size={12} className="text-amber-500"/>{order.hotel_name || "—"}</p>
                        {order.room_number && <p className="text-[11px] text-slate-400">Room {order.room_number}</p>}
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <CalendarClock size={10}/> {order.delivery_date} {order.delivery_time && `at ${order.delivery_time}`}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <Package size={14} className="text-slate-400" />
                          <span className="font-semibold text-slate-700 text-sm">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-black text-slate-800">${parseFloat(order.total_amount || 0).toFixed(2)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <CreditCard size={13} className="text-slate-400" />
                          <span className="text-sm text-slate-600 font-medium capitalize">{order.payment_method || "—"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${s.bg} ${s.text} ${s.border}`}>
                          {s.icon}{order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1.5">
                          <button onClick={() => setSelectedOrder(order)} title="View Details"
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => { setEditingOrder(order); setNewStatus(order.status); }} title="Update Status"
                            className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDelete(order.id)} disabled={deleting === order.id}
                            title="Delete" className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-40">
                            {deleting === order.id ? <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" /> : <Trash2 size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-lg font-black text-slate-800">Order #ORD-{selectedOrder.id}</h3>
                <p className="text-slate-500 text-sm">Full order details</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Customer */}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Customer Info</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-slate-400 text-xs">Name</p><p className="font-bold text-slate-700">{selectedOrder.user?.name || selectedOrder.user?.first_name || "Guest"}</p></div>
                  <div><p className="text-slate-400 text-xs">Phone</p><p className="font-bold text-slate-700">{selectedOrder.phone || "—"}</p></div>
                  <div><p className="text-slate-400 text-xs">Hotel</p><p className="font-bold text-slate-700">{selectedOrder.hotel_name || "—"}</p></div>
                  <div><p className="text-slate-400 text-xs">Room</p><p className="font-bold text-slate-700">{selectedOrder.room_number || "—"}</p></div>
                </div>
              </div>
              {/* Delivery */}
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Delivery Info</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-slate-400 text-xs">Date</p><p className="font-bold text-slate-700">{selectedOrder.delivery_date || "—"}</p></div>
                  <div><p className="text-slate-400 text-xs">Time</p><p className="font-bold text-slate-700">{selectedOrder.delivery_time || "—"}</p></div>
                  <div><p className="text-slate-400 text-xs">Payment</p><p className="font-bold text-slate-700 capitalize">{selectedOrder.payment_method || "—"}</p></div>
                  <div>
                    <p className="text-slate-400 text-xs">Status</p>
                    {(() => { const s = STATUS_STYLES[selectedOrder.status] || STATUS_STYLES.Pending; return (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${s.bg} ${s.text} ${s.border}`}>{s.icon}{selectedOrder.status}</span>
                    ); })()}
                  </div>
                </div>
              </div>
              {/* Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Order Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 font-black text-xs">{item.quantity}×</div>
                          <span className="font-semibold text-slate-700 text-sm">{item.product?.name || `Product #${item.product_id}`}</span>
                        </div>
                        <span className="font-bold text-slate-800 text-sm">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                      <span className="font-black text-slate-700">Total</span>
                      <span className="font-black text-amber-600 text-lg">${parseFloat(selectedOrder.total_amount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => { setSelectedOrder(null); setEditingOrder(selectedOrder); setNewStatus(selectedOrder.status); }}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition">
                  Update Status
                </button>
                <button onClick={() => setSelectedOrder(null)} className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold text-sm transition">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <div>
                <h3 className="text-lg font-black text-slate-800">Update Order #ORD-{editingOrder.id}</h3>
                <p className="text-slate-500 text-sm">Change the order status</p>
              </div>
              <button onClick={() => setEditingOrder(null)} className="text-slate-400 hover:text-slate-600 hover:bg-white/60 p-1.5 rounded-lg transition"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Select New Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Pending", "Processing", "Delivered", "Cancelled"].map(s => {
                    const style = STATUS_STYLES[s];
                    return (
                      <button key={s} type="button" onClick={() => setNewStatus(s)}
                        className={`py-3 rounded-xl text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                          newStatus === s
                            ? `${style.border} ${style.bg} ${style.text} border-2`
                            : "border-slate-200 text-slate-500 hover:border-slate-300 bg-white"
                        }`}>
                        {style.icon}{s}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingOrder(null)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition text-sm">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition text-sm shadow-lg shadow-amber-200 disabled:opacity-60">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
