import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { Users, Ticket, Building2, DollarSign, FileText, FileSpreadsheet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    axiosClient.get("/admin/stats").then((res) => setStats(res.data));
  }, []);

  if (!stats) return <p>Loading state...</p>;

  // Mock data for charts (Will use this if backend doesn't provide historical data)
  const chartData = stats.historical_data || [
    { name: 'Jan', revenue: 15000, bookings: 120 },
    { name: 'Feb', revenue: 22000, bookings: 180 },
    { name: 'Mar', revenue: 18000, bookings: 150 },
    { name: 'Apr', revenue: 35000, bookings: 290 },
    { name: 'May', revenue: 42000, bookings: 350 },
    { name: 'Jun', revenue: 58000, bookings: 480 },
  ];

  const exportPDF = () => {
    const input = document.getElementById('dashboard-content');
    if (input) {
      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('Kemet_Analytics_Report.pdf');
      });
    }
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Metric: 'Total Users', Value: stats.users },
      { Metric: 'Total Bookings', Value: stats.bookings },
      { Metric: 'Listed Hotels', Value: stats.hotels },
      { Metric: 'Gross Revenue (EGP)', Value: stats.revenue || 0 },
      { Metric: 'Net Profit (EGP)', Value: stats.profit || 0 }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Overview");
    XLSX.writeFile(wb, "Kemet_Analytics_Report.xlsx");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Dashboard Overview</h2>
        <div className="flex gap-3">
          <button onClick={exportExcel} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold transition shadow-sm">
            <FileSpreadsheet size={20} /> Export Excel
          </button>
          <button onClick={exportPDF} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition shadow-sm">
            <FileText size={20} /> Export PDF
          </button>
        </div>
      </div>
      
      <div id="dashboard-content" className="bg-slate-50 p-4 -m-4 rounded-xl">
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

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6">📈 Revenue Trend (Last 6 Months)</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6">📊 Bookings Volume</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
    </div>
  );
}
