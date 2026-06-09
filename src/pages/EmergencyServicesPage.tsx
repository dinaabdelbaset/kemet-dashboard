// @ts-nocheck
import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { Trash2, Edit, Plus, X, Phone, HeartPulse, Building2, Landmark } from "lucide-react";

interface EmergencyService {
  id?: number;
  name: string;
  type: "hospital" | "pharmacy" | "embassy" | "hotline";
  phone: string;
  city: string;
  address?: string;
  details?: string;
}

export default function EmergencyServicesPage() {
  const [services, setServices] = useState<EmergencyService[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EmergencyService>({
    name: "",
    type: "hospital",
    phone: "",
    city: "Cairo",
    address: "",
    details: ""
  });

  const fetchServices = () => {
    setLoading(true);
    axiosClient.get("/admin/emergency-services")
      .then((res) => {
        setServices(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      type: "hospital",
      phone: "",
      city: "Cairo",
      address: "",
      details: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (service: EmergencyService) => {
    setIsEditing(true);
    setFormData({ ...service });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axiosClient.put(`/admin/emergency-services/${formData.id}`, formData);
      } else {
        await axiosClient.post("/admin/emergency-services", formData);
      }
      closeModal();
      fetchServices();
    } catch (err) {
      console.error(err);
      alert("Error saving emergency service!");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this emergency service?")) {
      try {
        await axiosClient.delete(`/admin/emergency-services/${id}`);
        fetchServices();
      } catch (err) {
        console.error(err);
        alert("Error deleting service!");
      }
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "hospital":
        return <HeartPulse className="text-red-500" size={24} />;
      case "pharmacy":
        return <Building2 className="text-emerald-500" size={24} />;
      case "embassy":
        return <Landmark className="text-blue-500" size={24} />;
      default:
        return <Phone className="text-amber-500" size={24} />;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Emergency & Support Services</h2>
          <p className="text-slate-500 text-sm mt-1">Manage public hotlines, certified hospitals, pharmacies, and embassies</p>
        </div>
        <button onClick={openAddModal} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition shadow-sm">
          <Plus size={20} /> Add New Service
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-500 font-medium">No emergency services registered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 p-6 flex flex-col group card-tilt-effect transition-all duration-300">
              <div className="card-tilt-inner flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      {getServiceIcon(service.type)}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      service.type === 'hospital' ? 'bg-red-50 text-red-600 border-red-100' :
                      service.type === 'pharmacy' ? 'bg-green-50 text-green-600 border-green-100' :
                      service.type === 'embassy' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {service.type}
                    </span>
                  </div>
                  
                  <h3 className="font-extrabold text-lg text-slate-800 mb-1 group-hover:text-amber-500 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-slate-500 text-sm font-semibold mb-3">{service.city}</p>
                  
                  {service.address && (
                    <p className="text-slate-400 text-xs mb-2 leading-relaxed">
                      📍 {service.address}
                    </p>
                  )}
                  {service.details && (
                    <p className="text-slate-400 text-xs mb-4 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                      ℹ️ {service.details}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <span className="font-black text-slate-800 text-base">{service.phone}</span>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(service)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg transition border border-blue-100">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(service.id!)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition border border-red-100">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'Edit Service' : 'Add New Service'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Service Name / Title</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500" placeholder="e.g. As-Salam International Hospital" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                  <select required value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 bg-white font-bold text-slate-700">
                    <option value="hospital">🏥 Hospital</option>
                    <option value="pharmacy">💊 Pharmacy</option>
                    <option value="embassy">🏛️ Embassy</option>
                    <option value="hotline">📞 Hotline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone Number</label>
                  <input required type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500" placeholder="e.g. 19888 or +20 2..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City</label>
                <input required type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500" placeholder="e.g. Cairo, Giza, Alexandria" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Address</label>
                <input type="text" value={formData.address || ""} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500" placeholder="e.g. Corniche El Nile, Maadi" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Details / Working Hours</label>
                <textarea value={formData.details || ""} onChange={e => setFormData({ ...formData, details: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 h-20 resize-none" placeholder="e.g. Open 24/7, contains ICU department..." />
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg font-bold transition">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition shadow-sm">Save Service</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
