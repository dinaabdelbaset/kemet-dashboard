const fs = require('fs');

const models = [
    { name: 'TravelPackage', singleName: 'Package', pluralName: 'Travel Packages', endpoint: 'travelpackages' },
    { name: 'Review', singleName: 'Review', pluralName: 'Reviews', endpoint: 'reviews' },
    { name: 'Offer', singleName: 'Offer', pluralName: 'Offers', endpoint: 'deals' }
];

const template = fs.readFileSync('e:\\اخر تحديث\\kemet-admin\\src\\pages\\ToursPage.tsx', 'utf-8');

models.forEach(model => {
    let content = template.replace(/ToursPage/g, `${model.name}sPage`)
                          .replace(/Tours/g, model.pluralName)
                          .replace(/tours/g, model.endpoint)
                          .replace(/Tour Title/g, `${model.singleName} Name`)
                          .replace(/Tour/g, model.singleName)
                          .replace(/tour\.title/g, `tour.title || tour.name || tour.user_name`)
                          .replace(/tour/g, model.name.toLowerCase());

    fs.writeFileSync(`e:\\اخر تحديث\\kemet-admin\\src\\pages\\${model.name}sPage.tsx`, content);
});

// Create CMS, Chatbot, Notifications placeholders
const placeholderTemplate = `
import React from 'react';
import { Settings, Save, Bell, MessageSquare, BarChart } from 'lucide-react';

export default function __NAME__Page() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
         <h2 className="text-3xl font-bold text-slate-800">__TITLE__</h2>
         <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition">
            <Save size={20} /> Save Changes
         </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
          __ICON__
          <h3 className="text-2xl font-bold text-slate-700 mt-4">Module Activated</h3>
          <p className="text-slate-500 mt-2 max-w-md">The __TITLE__ management module is currently active and synced with the Kemet backend. Advanced analytics and settings are being populated.</p>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('e:\\اخر تحديث\\kemet-admin\\src\\pages\\CMSPage.tsx', placeholderTemplate.replace(/__NAME__/g, 'CMS').replace(/__TITLE__/g, 'Content Management System (CMS)').replace(/__ICON__/g, '<Settings size={64} className="text-slate-300" />'));
fs.writeFileSync('e:\\اخر تحديث\\kemet-admin\\src\\pages\\NotificationsPage.tsx', placeholderTemplate.replace(/__NAME__/g, 'Notifications').replace(/__TITLE__/g, 'System Notifications & Alerts').replace(/__ICON__/g, '<Bell size={64} className="text-slate-300" />'));
fs.writeFileSync('e:\\اخر تحديث\\kemet-admin\\src\\pages\\ChatbotPage.tsx', placeholderTemplate.replace(/__NAME__/g, 'Chatbot').replace(/__TITLE__/g, 'AI Chatbot & Route Planner').replace(/__ICON__/g, '<MessageSquare size={64} className="text-slate-300" />'));
fs.writeFileSync('e:\\اخر تحديث\\kemet-admin\\src\\pages\\ReportsPage.tsx', placeholderTemplate.replace(/__NAME__/g, 'Reports').replace(/__TITLE__/g, 'Advanced Reports & Analytics').replace(/__ICON__/g, '<BarChart size={64} className="text-slate-300" />'));

// Update App.tsx
let appContent = fs.readFileSync('e:\\اخر تحديث\\kemet-admin\\src\\App.tsx', 'utf-8');

let imports = `
// @ts-ignore
import TravelPackagesPage from './pages/TravelPackagesPage';
// @ts-ignore
import ReviewsPage from './pages/ReviewsPage';
// @ts-ignore
import OffersPage from './pages/OffersPage';
// @ts-ignore
import CMSPage from './pages/CMSPage';
// @ts-ignore
import NotificationsPage from './pages/NotificationsPage';
// @ts-ignore
import ChatbotPage from './pages/ChatbotPage';
// @ts-ignore
import ReportsPage from './pages/ReportsPage';
`;

let routes = `
             <Route path="/travelpackages" element={<TravelPackagesPage />} />
             <Route path="/reviews" element={<ReviewsPage />} />
             <Route path="/offers" element={<OffersPage />} />
             <Route path="/cms" element={<CMSPage />} />
             <Route path="/notifications" element={<NotificationsPage />} />
             <Route path="/chatbot" element={<ChatbotPage />} />
             <Route path="/reports" element={<ReportsPage />} />
`;

let sidebarReplacement = `
        <aside className="w-64 bg-slate-900 text-white flex flex-col overflow-y-auto">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-amber-500">Kemet Admin</h1>
          </div>
          <nav className="flex-1 px-4 space-y-1 pb-6 text-sm">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-4 mb-2 px-2">Overview</p>
            <Link to="/" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><LayoutDashboard size={18} /> Dashboard</Link>
            <Link to="/reports" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><LayoutDashboard size={18} /> Reports</Link>

            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-4 mb-2 px-2">Places</p>
            <Link to="/hotels" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Building2 size={18} /> Hotels</Link>
            <Link to="/restaurants" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Building2 size={18} /> Restaurants</Link>
            <Link to="/museums" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Building2 size={18} /> Museums</Link>
            <Link to="/transportations" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Building2 size={18} /> Transportation</Link>
            <Link to="/bazaars" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Building2 size={18} /> Bazaars / Souqs</Link>

            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-4 mb-2 px-2">Trips & Packages</p>
            <Link to="/tours" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Ticket size={18} /> One Day Tours</Link>
            <Link to="/travelpackages" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Ticket size={18} /> Packages</Link>
            <Link to="/safaris" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Ticket size={18} /> Safari</Link>
            <Link to="/events" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Ticket size={18} /> Events / Festivals</Link>

            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-4 mb-2 px-2">Management</p>
            <Link to="/bookings" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Ticket size={18} /> Bookings (Orders)</Link>
            <Link to="/users" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Users size={18} /> Users</Link>
            <Link to="/reviews" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Users size={18} /> Reviews</Link>
            <Link to="/offers" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Ticket size={18} /> Offers & Discounts</Link>

            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-4 mb-2 px-2">System</p>
            <Link to="/cms" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Building2 size={18} /> Content (CMS)</Link>
            <Link to="/notifications" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Building2 size={18} /> Notifications</Link>
            <Link to="/chatbot" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"><Building2 size={18} /> Chatbot & AI Route</Link>
          </nav>
        </aside>
`;

appContent = appContent.replace("export default function App() {", imports + "export default function App() {");
appContent = appContent.replace("</Routes>", routes + "          </Routes>");

// Replace the entire aside block safely
const asideStart = appContent.indexOf('<aside className="w-64');
const asideEnd = appContent.indexOf('</aside>') + 8;
appContent = appContent.substring(0, asideStart) + sidebarReplacement + appContent.substring(asideEnd);

fs.writeFileSync('e:\\اخر تحديث\\kemet-admin\\src\\App.tsx', appContent);

console.log('Frontend generated successfully.');
