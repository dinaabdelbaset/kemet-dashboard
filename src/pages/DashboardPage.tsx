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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
               <p className="text-sm text-slate-500 font-medium uppercase mb-1">Gross Revenue (Hotels/Tours)</p>
               <h3 className="text-3xl font-bold text-slate-800">{stats.revenue || 0} EGP</h3>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-slate-500"><DollarSign size={28} /></div>
         </div>

         <div className="bg-white p-6 rounded-xl shadow-sm flex items-center justify-between border-2 border-green-100">
            <div>
               <p className="text-sm text-green-600 font-bold uppercase mb-1">Your Net Profit (Kemet)</p>
               <h3 className="text-3xl font-black text-green-600">{stats.profit || 0} EGP</h3>
               <p className="text-xs text-slate-400 mt-1">Based on {stats.commission_rate || '15%'} platform commission</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg text-green-600"><DollarSign size={28} /></div>
         </div>
      </div>

      {/* Analytics Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        {/* Top Visited Places */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <h3 className="text-xl font-bold text-slate-800 mb-6">🏆 Most Visited Places</h3>
           {stats.top_places && stats.top_places.length > 0 ? (
             <div className="space-y-4">
               {stats.top_places.map((place: any, index: number) => (
                 <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                   <span className="font-bold text-slate-700">{place.title || place.name}</span>
                   <span className="bg-amber-100 text-amber-700 py-1 px-3 rounded-full text-xs font-bold">{place.visits} Bookings</span>
                 </div>
               ))}
             </div>
           ) : (
             <p className="text-slate-500 text-center py-6">No data available yet.</p>
           )}
        </div>

        {/* Top Users */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <h3 className="text-xl font-bold text-slate-800 mb-6">⭐ Best Users</h3>
           {stats.top_users && stats.top_users.length > 0 ? (
             <div className="space-y-4">
               {stats.top_users.map((user: any, index: number) => (
                 <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                       {user.name ? user.name.charAt(0) : 'U'}
                     </div>
                     <span className="font-bold text-slate-700">{user.name || 'Unknown User'}</span>
                   </div>
                   <span className="bg-purple-100 text-purple-700 py-1 px-3 rounded-full text-xs font-bold">{user.bookings} Bookings</span>
                 </div>
               ))}
             </div>
           ) : (
             <p className="text-slate-500 text-center py-6">No data available yet.</p>
           )}
        </div>
      </div>
    </div>
  );
}
