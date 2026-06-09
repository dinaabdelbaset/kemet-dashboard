import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';

import DashboardPage from './pages/DashboardPage';
import ThreePyramid from './components/ThreePyramid';
// @ts-ignore
import UsersPage from './pages/UsersPage';
// @ts-ignore
import BookingsPage from './pages/BookingsPage';
// @ts-ignore
import RoomsPage from "./pages/RoomsPage";
import HotelsPage from './pages/HotelsPage';
// @ts-ignore
import ToursPage from './pages/ToursPage';
// @ts-ignore
import SafarisPage from './pages/SafarisPage';
// @ts-ignore
import RestaurantsPage from './pages/RestaurantsPage';
// @ts-ignore
import MuseumsPage from './pages/MuseumsPage';
// @ts-ignore
import EventsPage from './pages/EventsPage';
// @ts-ignore
import BazaarsPage from './pages/BazaarsPage';
// @ts-ignore
import TransportationsPage from './pages/TransportationsPage';
import FlightsPage from './pages/FlightsPage';
// @ts-ignore
import TravelPackagesPage from './pages/TravelPackagesPage';
// @ts-ignore
import ReviewsPage from './pages/ReviewsPage';
// @ts-ignore
import OffersPage from './pages/OffersPage';
// @ts-ignore
import SettingsPage from './pages/SettingsPage';
// @ts-ignore
import CMSPage from './pages/CMSPage';
// @ts-ignore
import NotificationsPage from './pages/NotificationsPage';
// @ts-ignore
import ChatbotPage from './pages/ChatbotPage';
// @ts-ignore
import ReportsPage from './pages/ReportsPage';
// @ts-ignore
import LiveChatPage from './pages/LiveChatPage';
// @ts-ignore
import OrdersPage from './pages/OrdersPage';
// @ts-ignore
import EmergencyServicesPage from './pages/EmergencyServicesPage';
// @ts-ignore
import ArabTourismPage from './pages/ArabTourismPage';
// @ts-ignore
import HajjUmrahPage from './pages/HajjUmrahPage';
import {
  Bed, Building2, Map, Utensils, Landmark, CarFront, Store, Ticket, Plane,
  Package, Compass, CalendarDays, ScrollText, Bell, MessageSquare,
  Users, LayoutDashboard, Star, Tag, PieChart, Settings, Headset, ShoppingCart,
  Phone, Globe, Moon
} from 'lucide-react';

export default function App() {
  const [userRole, setUserRole] = useState<'superadmin' | 'hotel' | 'restaurant' | 'tour' | 'safari' | 'museum' | 'event' | 'bazaar' | 'transport' | 'flight' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const roleMap: Record<string, typeof userRole> = {
      'admin@kemat.com': 'superadmin',
      'hotel@kemat.com': 'hotel',
      'restaurant@kemat.com': 'restaurant',
      'tour@kemat.com': 'tour',
      'safari@kemat.com': 'safari',
      'museum@kemat.com': 'museum',
      'event@kemat.com': 'event',
      'bazaar@kemat.com': 'bazaar',
      'transport@kemat.com': 'transport',
      'flight@kemat.com': 'flight',
    };

    if (password === 'password123' && roleMap[email]) {
      setUserRole(roleMap[email]);
    } else {
      setError('Invalid email or password');
    }
  };

  if (!userRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 font-sans py-10 px-4">
        <div className="flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-4xl border border-slate-100">
          
          {/* Left Column: Premium 3D Golden Pyramid Showcase */}
          <div className="md:w-1/2 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
            
            <div className="relative z-10 flex flex-col items-center">
              <ThreePyramid size={250} />
              
              <h2 className="text-2xl font-black text-amber-500 tracking-widest mt-4 uppercase">Kemet Egypt</h2>
              <p className="text-slate-400 text-xs max-w-xs mt-2 font-medium leading-relaxed">
                Welcome back to Kemet Portal. Experience high-fidelity 3D and analytics in our unified administration dashboard.
              </p>
            </div>
          </div>

          {/* Right Column: Form */}
          <form onSubmit={handleLogin} className="md:w-1/2 p-8 md:p-10 space-y-6 flex flex-col justify-center bg-white">
            <div className="text-center flex flex-col items-center">
              <div className="bg-white w-20 h-20 rounded-2xl flex items-center justify-center shadow-[0_8px_24px_rgba(212,175,55,0.20)] border border-amber-500/20 mb-3">
                <svg viewBox="0 0 60 60" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="30,5 55,50 5,50" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5"/><polygon points="30,18 45,50 15,50" fill="#d97706" opacity="0.5"/></svg>
              </div>
              <h1 className="text-2xl font-black text-amber-500 tracking-wider mb-1">KEMET ADMIN</h1>
              <p className="text-slate-500 text-xs font-medium">Log in to your vendor or admin dashboard</p>
            </div>

            {error && <div className="bg-red-50 text-red-500 p-2.5 rounded-xl text-center text-xs font-bold border border-red-100">{error}</div>}

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 outline-none transition-all font-medium" placeholder="admin@kemat.com" required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 outline-none transition-all font-medium" placeholder="••••••••" required />
              </div>
            </div>

            <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black uppercase text-xs tracking-wider py-3 rounded-xl transition-all shadow-md shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5">Sign In</button>

            <div className="mt-4 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 h-36 overflow-y-auto">
              <p className="font-bold text-slate-700 mb-1.5 uppercase tracking-wide sticky top-0 bg-slate-50 py-0.5">Demo Accounts</p>
              <ul className="space-y-1.5 font-medium">
                <li className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100 shadow-sm"><span>👑 <b>Super Admin</b></span> <span className="text-amber-600">admin@kemat.com</span></li>
                <li className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100 shadow-sm"><span>🏨 <b>Hotels</b></span> <span className="text-blue-600">hotel@kemat.com</span></li>
                <li className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100 shadow-sm"><span>🍽️ <b>Restaurants</b></span> <span className="text-orange-600">restaurant@kemat.com</span></li>
                <li className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100 shadow-sm"><span>🗺️ <b>Tours</b></span> <span className="text-green-600">tour@kemat.com</span></li>
                <li className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100 shadow-sm"><span>🏛️ <b>Museums</b></span> <span className="text-purple-600">museum@kemat.com</span></li>
                <li className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100 shadow-sm"><span>🚙 <b>Safaris</b></span> <span className="text-yellow-600">safari@kemat.com</span></li>
                <li className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100 shadow-sm"><span>🎉 <b>Events</b></span> <span className="text-pink-600">event@kemat.com</span></li>
                <li className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100 shadow-sm"><span>🛍️ <b>Bazaars</b></span> <span className="text-rose-600">bazaar@kemat.com</span></li>
                <li className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100 shadow-sm"><span>🚌 <b>Transport</b></span> <span className="text-indigo-600">transport@kemat.com</span></li>
                <li className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-100 shadow-sm"><span>✈️ <b>Flights</b></span> <span className="text-sky-600">flight@kemat.com</span></li>
              </ul>
              <p className="mt-2 text-center border-t border-slate-200 pt-2 sticky bottom-0 bg-slate-50">Password for all: <strong>password123</strong></p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const roleName = userRole === 'superadmin' ? 'Super Admin' : userRole.charAt(0).toUpperCase() + userRole.slice(1) + ' Manager';

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-100 font-sans">
        <aside className="w-64 bg-slate-900 text-white flex flex-col overflow-y-auto shadow-2xl z-10 border-r border-slate-800 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="p-6 pb-2">
            <div className="flex items-center gap-3">
              <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.5)] border border-amber-500/30 shrink-0">
                <svg viewBox="0 0 60 60" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="30,5 55,50 5,50" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5"/><polygon points="30,18 45,50 15,50" fill="#d97706" opacity="0.5"/></svg>
              </div>
              <h1 className="text-[20px] font-black text-amber-500 tracking-widest leading-tight">KEMET<br /><span className="text-[12px] text-white/80 tracking-[0.2em]">ADMIN</span></h1>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{userRole}</span>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1 pb-6 text-sm">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-4 mb-2 px-3">Overview</p>
            <Link to="/" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><LayoutDashboard size={18} /> Dashboard</Link>
            {userRole === 'superadmin' && <Link to="/reports" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><PieChart size={18} /> Reports</Link>}

            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-6 mb-2 px-3">Manage Services</p>
            {(userRole === 'superadmin' || userRole === 'hotel') && <Link to="/hotels" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><Building2 size={18} /> {userRole === 'hotel' ? 'My Hotel' : 'Hotels'}</Link>}
            {(userRole === 'superadmin' || userRole === 'hotel') && <Link to="/rooms" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><Bed size={18} /> {userRole === 'hotel' ? 'My Rooms' : 'Rooms'}</Link>}
            {(userRole === 'superadmin' || userRole === 'restaurant') && <Link to="/restaurants" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><Utensils size={18} /> {userRole === 'restaurant' ? 'My Restaurant' : 'Restaurants'}</Link>}
            {(userRole === 'superadmin' || userRole === 'museum') && <Link to="/museums" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><Landmark size={18} /> {userRole === 'museum' ? 'My Museum' : 'Museums'}</Link>}
            {(userRole === 'superadmin' || userRole === 'transport') && <Link to="/transportations" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><CarFront size={18} /> {userRole === 'transport' ? 'My Fleet' : 'Transportation'}</Link>}
            {(userRole === 'superadmin' || userRole === 'flight') && <Link to="/flights" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><Plane size={18} /> {userRole === 'flight' ? 'My Flights' : 'Flights'}</Link>}
            {(userRole === 'superadmin' || userRole === 'bazaar') && <Link to="/bazaars" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><Store size={18} /> {userRole === 'bazaar' ? 'My Bazaar' : 'Bazaars / Souqs'}</Link>}
            {userRole === 'superadmin' && <Link to="/arab-tourism" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><Globe size={18} /> Arab Tourism</Link>}
            {userRole === 'superadmin' && <Link to="/emergency" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><Phone size={18} /> Emergency Services</Link>}

            {(userRole === 'superadmin' || ['tour', 'safari', 'event'].includes(userRole)) && (
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-6 mb-2 px-3">Trips & Packages</p>
            )}
            {(userRole === 'superadmin' || userRole === 'tour') && <Link to="/tours" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><Map size={18} /> {userRole === 'tour' ? 'My Tours' : 'One Day Tours'}</Link>}
            {userRole === 'superadmin' && <Link to="/travelpackages" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><Package size={18} /> Packages</Link>}
            {userRole === 'superadmin' && <Link to="/hajj-umrah" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><Moon size={18} /> Hajj & Umrah</Link>}
            {(userRole === 'superadmin' || userRole === 'safari') && <Link to="/safaris" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><Compass size={18} /> {userRole === 'safari' ? 'My Safaris' : 'Safari'}</Link>}
            {(userRole === 'superadmin' || userRole === 'event') && <Link to="/events" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><CalendarDays size={18} /> {userRole === 'event' ? 'My Events' : 'Events / Festivals'}</Link>}

            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-6 mb-2 px-3">Business</p>
            <Link to="/bookings" className="flex items-center gap-3 px-3 py-2.5 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-xl transition-all font-bold"><Ticket size={18} /> {userRole === 'superadmin' ? 'All Bookings' : 'My Bookings'}</Link>
            <Link to="/orders" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><ShoppingCart size={18} /> {userRole === 'superadmin' ? 'All Orders' : 'My Orders'}</Link>
            {userRole === 'superadmin' && <Link to="/users" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><Users size={18} /> Users</Link>}
            <Link to="/reviews" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><Star size={18} /> Reviews</Link>
            <Link to="/offers" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><Tag size={18} /> Offers</Link>

            {userRole === 'superadmin' && (
              <>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-6 mb-2 px-3">System Settings</p>
                <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><Settings size={18} /> Configurations</Link>
                <Link to="/cms" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><ScrollText size={18} /> Content (CMS)</Link>
                <Link to="/notifications" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><Bell size={18} /> Notifications</Link>
                <Link to="/chatbot" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><MessageSquare size={18} /> AI Chatbot Logic</Link>
                <Link to="/livechat" className="flex items-center gap-3 px-3 py-2.5 text-amber-400 hover:bg-slate-800 rounded-xl transition-all font-bold shadow-lg bg-amber-500/10 border-l-4 border-amber-500 relative">
                  <Headset size={18} /> Live Support
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                </Link>
              </>
            )}
          </nav>

          <div className="p-4 border-t border-slate-800/50 mt-auto">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center font-bold text-white shadow-lg">
                {userRole.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{roleName}</p>
                <p className="text-[10px] text-slate-400 truncate">{email}</p>
              </div>
            </div>
            <button onClick={() => setUserRole(null)} className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs uppercase tracking-wider rounded-xl transition-all">Sign Out</button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full p-8 bg-slate-50/50">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            {userRole === 'superadmin' && <Route path="/users" element={<UsersPage />} />}
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/orders" element={<OrdersPage />} />

            {(userRole === 'superadmin' || userRole === 'hotel') && <Route path="/hotels" element={<HotelsPage />} />}
            {(userRole === 'superadmin' || userRole === 'hotel') && <Route path="/rooms" element={<RoomsPage />} />}
            {(userRole === 'superadmin' || userRole === 'tour') && <Route path="/tours" element={<ToursPage />} />}
            {(userRole === 'superadmin' || userRole === 'safari') && <Route path="/safaris" element={<SafarisPage />} />}
            {(userRole === 'superadmin' || userRole === 'restaurant') && <Route path="/restaurants" element={<RestaurantsPage />} />}
            {(userRole === 'superadmin' || userRole === 'museum') && <Route path="/museums" element={<MuseumsPage />} />}
            {(userRole === 'superadmin' || userRole === 'event') && <Route path="/events" element={<EventsPage />} />}
            {(userRole === 'superadmin' || userRole === 'bazaar') && <Route path="/bazaars" element={<BazaarsPage />} />}
            {(userRole === 'superadmin' || userRole === 'transport') && <Route path="/transportations" element={<TransportationsPage />} />}
            {(userRole === 'superadmin' || userRole === 'flight') && <Route path="/flights" element={<FlightsPage />} />}

            {userRole === 'superadmin' && <Route path="/travelpackages" element={<TravelPackagesPage />} />}
            {userRole === 'superadmin' && <Route path="/emergency" element={<EmergencyServicesPage />} />}
            {userRole === 'superadmin' && <Route path="/arab-tourism" element={<ArabTourismPage />} />}
            {userRole === 'superadmin' && <Route path="/hajj-umrah" element={<HajjUmrahPage />} />}
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/offers" element={<OffersPage userRole={userRole} />} />

            {userRole === 'superadmin' && <Route path="/settings" element={<SettingsPage />} />}
            {userRole === 'superadmin' && <Route path="/cms" element={<CMSPage />} />}
            {userRole === 'superadmin' && <Route path="/notifications" element={<NotificationsPage />} />}
            {userRole === 'superadmin' && <Route path="/chatbot" element={<ChatbotPage />} />}
            {userRole === 'superadmin' && <Route path="/reports" element={<ReportsPage />} />}
            {userRole === 'superadmin' && <Route path="/livechat" element={<LiveChatPage />} />}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
