// @ts-nocheck
import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { Users, Ticket, Building2, DollarSign, FileText, FileSpreadsheet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      axiosClient.get("/admin/stats"),
      axiosClient.get("/admin/bookings")
    ]).then(([statsRes, bookingsRes]) => {
      setStats(statsRes.data);
      setBookings(bookingsRes.data);
    }).catch(err => {
      console.error("Error loading dashboard data:", err);
    });
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
    if (!input) {
      alert("Dashboard element not found!");
      return;
    }

    // Set scale to 1 to reduce memory load, disable useCORS to prevent security errors locally
    html2canvas(input, {
      scale: 1.2,
      useCORS: false,
      allowTaint: true,
      logging: true,
      backgroundColor: '#f8fafc',
      ignoreElements: (element) => {
        // Ignore elements that might fail canvas rendering due to cross-origin or charts blocking
        return false;
      }
    }).then((canvas) => {
      try {
        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const imgWidth = pdfWidth;
        const imgHeight = (canvasHeight * pdfWidth) / canvasWidth;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight; // Use standard page-by-page y translation
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }

        pdf.save('Kemet_Analytics_Report.pdf');
      } catch (pdfErr) {
        console.error("PDF generation error:", pdfErr);
        // Fallback: simple print window or direct download
        window.print();
      }
    }).catch((canvasErr) => {
      console.error("html2canvas error:", canvasErr);
      // Fallback: if html2canvas crashes completely, use native browser print dialog for the element
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Kemet Analytics Report</title>
              <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
              <style>
                body { font-family: sans-serif; padding: 20px; background-color: white; }
                /* Hide buttons on print */
                .no-print { display: none !important; }
              </style>
            </head>
            <body>
              <div class="max-w-4xl mx-auto">
                <h1 class="text-3xl font-bold mb-6 text-center text-slate-800">Kemet Analytics Report</h1>
                ${input.innerHTML}
              </div>
              <script>
                setTimeout(() => {
                  window.print();
                  window.close();
                }, 500);
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        alert("Failed to open print window. Please allow popups for this site.");
      }
    });
  };

  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: General Stats
    const wsOverview = XLSX.utils.json_to_sheet([
      { 'Metric / مؤشر الأداء': 'Total Users / إجمالي المستخدمين', 'Value / القيمة': stats.users },
      { 'Metric / مؤشر الأداء': 'Total Bookings / إجمالي الحجوزات', 'Value / القيمة': stats.bookings },
      { 'Metric / مؤشر الأداء': 'Listed Hotels / الفنادق المدرجة', 'Value / القيمة': stats.hotels },
      { 'Metric / مؤشر الأداء': 'Gross Revenue (EGP) / إجمالي الإيرادات', 'Value / القيمة': stats.revenue || 0 },
      { 'Metric / مؤشر الأداء': 'Net Profit (EGP) / صافي الأرباح كيميت 15%', 'Value / القيمة': stats.profit || 0 }
    ]);
    XLSX.utils.book_append_sheet(wb, wsOverview, "Financial Overview");

    // Sheet 2: Detailed Bookings (if available)
    if (bookings && bookings.length > 0) {
      const formattedBookings = bookings.map(b => {
        const total = parseFloat(b.total_price || b.price || 0);
        const profit = parseFloat(b.platform_profit || (total * 0.15).toFixed(2));
        const partner = parseFloat(b.partner_share || (total - profit).toFixed(2));
        return {
          'Booking ID / رقم الحجز': `BKG-${b.id}`,
          'Customer Name / العميل': b.user?.name || (b.user?.first_name ? `${b.user.first_name} ${b.user.last_name || ''}` : 'Guest'),
          'Customer Email / البريد الإلكتروني': b.user?.email || 'N/A',
          'Service Item / الخدمة المحجوزة': b.item_title || 'Service Item',
          'Service Type / نوع الخدمة': b.booking_type || b.item_type || 'Booking',
          'Paid Amount / المبلغ المدفوع (EGP)': total,
          'Kemet Share (15%) / أرباح كيميت': profit,
          'Partner Share (85%) / أرباح الشريك': partner,
          'Status / الحالة': b.status || 'confirmed'
        };
      });
      const wsBookings = XLSX.utils.json_to_sheet(formattedBookings);
      XLSX.utils.book_append_sheet(wb, wsBookings, "Bookings Ledger");
    }

    // Sheet 3: Top Places
    if (stats.top_places && stats.top_places.length > 0) {
      const formattedPlaces = stats.top_places.map(p => ({
        'Place / المكان': p.title || p.name,
        'Visits Count / عدد الحجوزات والزيارات': p.visits
      }));
      const wsPlaces = XLSX.utils.json_to_sheet(formattedPlaces);
      XLSX.utils.book_append_sheet(wb, wsPlaces, "Top Visited Places");
    }

    // Save File
    XLSX.writeFile(wb, "Kemet_Detailed_Analytics_Report.xlsx");
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
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
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

        {/* Detailed Profits & Commission Splits Ledger */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              🧾 سجل العمولات وتوزيع الأرباح المفصل (Commissions & Payouts Ledger)
            </h3>
            <span className="bg-amber-100 text-amber-700 py-1 px-3 rounded-full text-xs font-bold">15% vs 85% Split</span>
          </div>

          {bookings && bookings.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-slate-100 shadow-inner">
              <table className="w-full text-right text-sm border-collapse table-auto">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] text-slate-500 font-bold uppercase tracking-wider text-right">
                    <th className="p-4 text-center">رقم الحجز</th>
                    <th className="p-4 text-right">العميل (Customer)</th>
                    <th className="p-4 text-right">الخدمة المحجوزة (Service)</th>
                    <th className="p-4 text-center font-bold">الإجمالي المدفوع (Paid)</th>
                    <th className="p-4 text-center text-emerald-600 font-bold">نصيب كيميت (Kemet 15%)</th>
                    <th className="p-4 text-center text-blue-600 font-bold">نصيب الشريك (Partner 85%)</th>
                    <th className="p-4 text-center">الحالة (Status)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white">
                  {bookings.map((booking) => {
                    const total = parseFloat(booking.total_price || booking.price || 0);
                    const profit = parseFloat(booking.platform_profit || (total * 0.15).toFixed(2));
                    const partner = parseFloat(booking.partner_share || (total - profit).toFixed(2));
                    const userName = booking.user?.name || (booking.user?.first_name ? `${booking.user.first_name} ${booking.user.last_name || ''}` : 'Guest');
                    const userEmail = booking.user?.email || 'N/A';

                    return (
                      <tr key={booking.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 text-center font-bold text-slate-700 font-mono">BKG-{booking.id}</td>
                        <td className="p-4 text-right">
                          <div className="font-semibold text-slate-800">{userName}</div>
                          <div className="text-xs text-slate-400 font-medium">{userEmail}</div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="font-semibold text-slate-800">{booking.item_title || 'Service Item'}</div>
                          <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold tracking-wider uppercase mt-1">
                            {booking.booking_type || booking.item_type || 'Booking'}
                          </span>
                        </td>
                        <td className="p-4 text-center font-extrabold text-slate-800">
                          {total.toFixed(2)} EGP
                        </td>
                        <td className="p-4 text-center font-black text-emerald-600 bg-emerald-50/20">
                          +{profit.toFixed(2)} EGP
                        </td>
                        <td className="p-4 text-center font-black text-blue-600 bg-blue-50/20">
                          +{partner.toFixed(2)} EGP
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${booking.status === 'cancelled'
                            ? 'bg-red-50 text-red-600 border-red-100'
                            : 'bg-green-50 text-green-600 border-green-100'
                            }`}>
                            {booking.status || 'confirmed'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium text-sm">لا توجد سجلات مالية مسجلة حالياً</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
