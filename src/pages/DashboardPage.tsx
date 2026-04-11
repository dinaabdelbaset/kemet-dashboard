import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { Users, Ticket, Building2, DollarSign } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    axiosClient.get("/admin/stats").then((res) => setStats(res.data));
  }, []);

  if (!stats) return <p>Loading state...</p>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-slate-800">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between border border-slate-100">
            <div>
               <p className="text-sm text-slate-500 font-medium uppercase mb-1">Total Users</p>
               <h3 className="text-3xl font-bold text-slate-800">{stats.users}</h3>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-blue-500"><Users size={28} /></div>
         </div>

         <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between border border-slate-100">
            <div>
               <p className="text-sm text-slate-500 font-medium uppercase mb-1">Total Bookings</p>
               <h3 className="text-3xl font-bold text-slate-800">{stats.bookings}</h3>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-purple-500"><Ticket size={28} /></div>
         </div>

         <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between border border-slate-100">
            <div>
               <p className="text-sm text-slate-500 font-medium uppercase mb-1">Listed Hotels</p>
               <h3 className="text-3xl font-bold text-slate-800">{stats.hotels}</h3>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg text-amber-500"><Building2 size={28} /></div>
         </div>

         <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between border border-slate-100">
            <div>
               <p className="text-sm text-slate-500 font-medium uppercase mb-1">Total Revenue</p>
               <h3 className="text-3xl font-bold text-slate-800">{stats.revenue || 0} EGP</h3>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-green-500"><DollarSign size={28} /></div>
         </div>
      </div>
    </div>
  );
}
