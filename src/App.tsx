import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
// @ts-ignore
import UsersPage from './pages/UsersPage';
// @ts-ignore
import BookingsPage from './pages/BookingsPage';
// @ts-ignore
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
import { 
  Building2, 
  Map, 
  Utensils, 
  Landmark, 
  CarFront, 
  Store, 
  Ticket, 
  Package, 
  Compass, 
  CalendarDays, 
  ScrollText,
  Bell,
  MessageSquare,
  Users,
  LayoutDashboard,
  Star,
  Tag,
  PieChart,
  Settings
} from 'lucide-react';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        
        <aside className="w-64 bg-slate-900 text-white flex flex-col overflow-y-auto">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-amber-500">Kemet Admin</h1>
          </div>
          <nav className="flex-1 px-4 space-y-1 pb-6 text-sm">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-4 mb-2 px-2">Overview</p>
            <Link to="/" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><LayoutDashboard size={18} /> Dashboard</Link>
            <Link to="/reports" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><PieChart size={18} /> Reports</Link>

            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-4 mb-2 px-2">Places</p>
            <Link to="/hotels" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Building2 size={18} /> Hotels</Link>
            <Link to="/restaurants" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Utensils size={18} /> Restaurants</Link>
            <Link to="/museums" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Landmark size={18} /> Museums</Link>
            <Link to="/transportations" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><CarFront size={18} /> Transportation</Link>
            <Link to="/bazaars" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Store size={18} /> Bazaars / Souqs</Link>

            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-4 mb-2 px-2">Trips & Packages</p>
            <Link to="/tours" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Map size={18} /> One Day Tours</Link>
            <Link to="/travelpackages" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Package size={18} /> Packages</Link>
            <Link to="/safaris" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Compass size={18} /> Safari</Link>
            <Link to="/events" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><CalendarDays size={18} /> Events / Festivals</Link>

            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-4 mb-2 px-2">Management</p>
            <Link to="/bookings" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Ticket size={18} /> Bookings (Orders)</Link>
            <Link to="/users" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Users size={18} /> Users</Link>
            <Link to="/reviews" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Star size={18} /> Reviews</Link>
            <Link to="/offers" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Tag size={18} /> Offers & Discounts</Link>

            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-4 mb-2 px-2">System</p>
            <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Settings size={18} /> Settings</Link>
            <Link to="/cms" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><ScrollText size={18} /> Content (CMS)</Link>
            <Link to="/notifications" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Bell size={18} /> Notifications</Link>
            <Link to="/chatbot" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><MessageSquare size={18} /> Chatbot & AI Route</Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full p-8">
          <Routes>
             <Route path="/" element={<DashboardPage />} />
             <Route path="/users" element={<UsersPage />} />
             <Route path="/bookings" element={<BookingsPage />} />
             <Route path="/hotels" element={<HotelsPage />} />
             <Route path="/tours" element={<ToursPage />} />
                       <Route path="/safaris" element={<SafarisPage />} />
             <Route path="/restaurants" element={<RestaurantsPage />} />
             <Route path="/museums" element={<MuseumsPage />} />
             <Route path="/events" element={<EventsPage />} />
             <Route path="/bazaars" element={<BazaarsPage />} />
             <Route path="/transportations" element={<TransportationsPage />} />
          
             <Route path="/travelpackages" element={<TravelPackagesPage />} />
             <Route path="/reviews" element={<ReviewsPage />} />
             <Route path="/offers" element={<OffersPage />} />
             <Route path="/settings" element={<SettingsPage />} />
             <Route path="/cms" element={<CMSPage />} />
             <Route path="/notifications" element={<NotificationsPage />} />
             <Route path="/chatbot" element={<ChatbotPage />} />
             <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
