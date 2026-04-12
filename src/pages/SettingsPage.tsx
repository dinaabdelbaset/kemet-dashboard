import { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const [commissionRate, setCommissionRate] = useState<string>("15");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Fetch stats to get the current commission rate
    axiosClient.get("/admin/stats")
      .then(res => {
        if (res.data.commission_rate) {
           setCommissionRate(res.data.commission_rate.replace('%', ''));
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      // Assuming a generic settings endpoint or simulating save
      await axiosClient.post("/admin/settings", {
        commission_rate: `${commissionRate}%`
      });
      setMessage({ text: "Settings saved successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to save settings. Please try again.", type: "error" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Platform Settings</h2>
        <p className="text-slate-500 mt-2">Manage global platform configurations, commissions, and fees.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <h3 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">Financial Settings</h3>
        
        {message && (
          <div className={`p-4 mb-6 rounded-lg text-sm font-bold ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="max-w-xl">
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Platform Booking Commission (%)
            </label>
            <p className="text-xs text-slate-500 mb-3">
              This percentage defines the platform's revenue share from any third-party external bookings (Flights, External Hotels, etc.)
            </p>
            <div className="relative">
              <input 
                type="number" 
                min="0" 
                max="100"
                required
                value={commissionRate} 
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full p-3 pl-10 border border-slate-200 rounded-lg outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-bold text-slate-800"
                placeholder="15"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-400 font-bold">%</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              disabled={isSaving}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition"
            >
              <Save size={18} />
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
