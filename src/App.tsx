import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Ticket } from 'lucide-react';
import DashboardPage from './pages/DashboardPage';
// @ts-ignore
import UsersPage from './pages/UsersPage';
// @ts-ignore
import BookingsPage from './pages/BookingsPage';
// @ts-ignore
import HotelsPage from './pages/HotelsPage'; 

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-amber-500">Kemet Admin</h1>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition">
              <LayoutDashboard size={20} /> Dashboard
            </Link>
            <Link to="/users" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition">
              <Users size={20} /> Users
            </Link>
            <Link to="/bookings" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition">
              <Ticket size={20} /> Bookings
            </Link>
            <Link to="/hotels" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition">
              <Building2 size={20} /> Hotels
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full p-8">
          <Routes>
             <Route path="/" element={<DashboardPage />} />
             <Route path="/users" element={<UsersPage />} />
             <Route path="/bookings" element={<BookingsPage />} />
             <Route path="/hotels" element={<HotelsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
