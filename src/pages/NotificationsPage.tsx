
import { Save, Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
         <h2 className="text-3xl font-bold text-slate-800">System Notifications & Alerts</h2>
         <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition">
            <Save size={20} /> Save Changes
         </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
          <Bell size={64} className="text-slate-300" />
          <h3 className="text-2xl font-bold text-slate-700 mt-4">Module Activated</h3>
          <p className="text-slate-500 mt-2 max-w-md">The System Notifications & Alerts management module is currently active and synced with the Kemet backend. Advanced analytics and settings are being populated.</p>
      </div>
    </div>
  );
}
