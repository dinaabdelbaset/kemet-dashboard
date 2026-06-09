// @ts-nocheck
import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { Trash2, Edit, Plus, X, Calendar, DollarSign, Hotel, Star, Info, FileText, Plane, Car } from "lucide-react";

interface HajjUmrahPackage {
  id?: number;
  name_en: string;
  name_ar: string;
  price: number;
  hotel_makkah_en: string;
  hotel_makkah_ar: string;
  hotel_madinah_en: string;
  hotel_madinah_ar: string;
  hotel_makkah_id?: number;
  hotel_madinah_id?: number;
  flight_id?: number;
  transportation_id?: number;
  hotel_makkah?: any;
  hotel_madinah?: any;
  flight?: any;
  transportation?: any;
  duration_days: number;
  description_en: string;
  description_ar: string;
  image?: string;
  features_en: string[];
  features_ar: string[];
}

export default function HajjUmrahPage() {
  const [packages, setPackages] = useState<HajjUmrahPackage[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);
  const [transportations, setTransportations] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState<any>({
    name_en: "",
    name_ar: "",
    price: "",
    hotel_makkah_en: "",
    hotel_makkah_ar: "",
    hotel_madinah_en: "",
    hotel_madinah_ar: "",
    hotel_makkah_id: "",
    hotel_madinah_id: "",
    flight_id: "",
    transportation_id: "",
    duration_days: "",
    description_en: "",
    description_ar: "",
    image: "",
    features_en_raw: "",
    features_ar_raw: ""
  });

  const fetchPackages = () => {
    setLoading(true);
    axiosClient.get("/hajj-umrah/packages")
      .then((res) => {
        setPackages(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchRelations = async () => {
    try {
      const [hotelsRes, flightsRes, transportationsRes] = await Promise.all([
        axiosClient.get("/admin/hotels"),
        axiosClient.get("/admin/flights"),
        axiosClient.get("/admin/transportations")
      ]);
      setHotels(hotelsRes.data);
      setFlights(flightsRes.data);
      setTransportations(transportationsRes.data);
    } catch (err) {
      console.error("Failed to fetch relations:", err);
    }
  };

  useEffect(() => {
    fetchPackages();
    fetchRelations();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      name_en: "",
      name_ar: "",
      price: "",
      hotel_makkah_en: "",
      hotel_makkah_ar: "",
      hotel_madinah_en: "",
      hotel_madinah_ar: "",
      hotel_makkah_id: "",
      hotel_madinah_id: "",
      flight_id: "",
      transportation_id: "",
      duration_days: "",
      description_en: "",
      description_ar: "",
      image: "",
      features_en_raw: "",
      features_ar_raw: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: HajjUmrahPackage) => {
    setIsEditing(true);
    setFormData({
      id: pkg.id,
      name_en: pkg.name_en,
      name_ar: pkg.name_ar,
      price: pkg.price.toString(),
      hotel_makkah_en: pkg.hotel_makkah_en || "",
      hotel_makkah_ar: pkg.hotel_makkah_ar || "",
      hotel_madinah_en: pkg.hotel_madinah_en || "",
      hotel_madinah_ar: pkg.hotel_madinah_ar || "",
      hotel_makkah_id: pkg.hotel_makkah_id || "",
      hotel_madinah_id: pkg.hotel_madinah_id || "",
      flight_id: pkg.flight_id || "",
      transportation_id: pkg.transportation_id || "",
      duration_days: pkg.duration_days.toString(),
      description_en: pkg.description_en,
      description_ar: pkg.description_ar,
      image: pkg.image || "",
      features_en_raw: Array.isArray(pkg.features_en) ? pkg.features_en.join(", ") : "",
      features_ar_raw: Array.isArray(pkg.features_ar) ? pkg.features_ar.join(", ") : ""
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse arrays
    const features_en = formData.features_en_raw
      ? formData.features_en_raw.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];
    const features_ar = formData.features_ar_raw
      ? formData.features_ar_raw.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      name_en: formData.name_en,
      name_ar: formData.name_ar,
      price: parseFloat(formData.price),
      hotel_makkah_en: formData.hotel_makkah_en || null,
      hotel_makkah_ar: formData.hotel_makkah_ar || null,
      hotel_madinah_en: formData.hotel_madinah_en || null,
      hotel_madinah_ar: formData.hotel_madinah_ar || null,
      hotel_makkah_id: formData.hotel_makkah_id ? parseInt(formData.hotel_makkah_id) : null,
      hotel_madinah_id: formData.hotel_madinah_id ? parseInt(formData.hotel_madinah_id) : null,
      flight_id: formData.flight_id ? parseInt(formData.flight_id) : null,
      transportation_id: formData.transportation_id ? parseInt(formData.transportation_id) : null,
      duration_days: parseInt(formData.duration_days),
      description_en: formData.description_en,
      description_ar: formData.description_ar,
      image: formData.image || null,
      features_en,
      features_ar
    };

    try {
      if (isEditing) {
        await axiosClient.put(`/admin/hajj-umrah/packages/${formData.id}`, payload);
      } else {
        await axiosClient.post("/admin/hajj-umrah/packages", payload);
      }
      closeModal();
      fetchPackages();
    } catch (err) {
      console.error(err);
      alert("Error saving package!");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this Hajj/Umrah package?")) {
      try {
        await axiosClient.delete(`/admin/hajj-umrah/packages/${id}`);
        fetchPackages();
      } catch (err) {
        console.error(err);
        alert("Error deleting package!");
      }
    }
  };

  // Helper to handle hotel selections to autofill text inputs if needed
  const handleHotelSelect = (type: "makkah" | "madinah", hotelId: string) => {
    const selected = hotels.find(h => h.id.toString() === hotelId);
    if (type === "makkah") {
      setFormData(prev => ({
        ...prev,
        hotel_makkah_id: hotelId,
        hotel_makkah_en: selected ? (selected.title || selected.name) : prev.hotel_makkah_en,
        hotel_makkah_ar: selected ? (selected.title || selected.name) : prev.hotel_makkah_ar
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        hotel_madinah_id: hotelId,
        hotel_madinah_en: selected ? (selected.title || selected.name) : prev.hotel_madinah_en,
        hotel_madinah_ar: selected ? (selected.title || selected.name) : prev.hotel_madinah_ar
      }));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Hajj & Umrah Packages</h2>
          <p className="text-slate-500 text-sm mt-1">Manage spiritual travel packages, hotels, flights, transportations, and pricing</p>
        </div>
        <button onClick={openAddModal} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition shadow-sm">
          <Plus size={20} /> Add New Package
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <p className="text-slate-500 font-medium">No Hajj or Umrah packages registered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col group card-tilt-effect transition-all duration-300">
              <div className="card-tilt-inner flex-1 flex flex-col justify-between">
                <div>
                  <div className="relative h-48 overflow-hidden bg-slate-900">
                    <img 
                      src={pkg.image || "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?auto=format&fit=crop&w=600&q=80"} 
                      alt={pkg.name_en} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" 
                    />
                    <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 rounded-xl font-bold text-xs shadow-md flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{pkg.duration_days} Days</span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Spiritual Package
                      </span>
                      <span className="font-sans text-xs text-slate-400 font-semibold">{pkg.name_en}</span>
                    </div>

                    <h3 className="font-extrabold text-xl text-slate-800 mb-4 text-right">
                      {pkg.name_ar}
                    </h3>

                    {/* Accommodation Info */}
                    <div className="space-y-2.5 mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100/50 text-right">
                      {/* Makkah Hotel */}
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700">
                          {pkg.hotel_makkah ? (pkg.hotel_makkah.title || pkg.hotel_makkah.name) : (pkg.hotel_makkah_ar || "N/A")}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1">
                          فندق مكة <Hotel size={12} className="text-amber-500" />
                        </span>
                      </div>
                      
                      {/* Madinah Hotel */}
                      <div className="flex justify-between items-center text-xs border-t border-slate-200/50 pt-2">
                        <span className="font-semibold text-slate-700">
                          {pkg.hotel_madinah ? (pkg.hotel_madinah.title || pkg.hotel_madinah.name) : (pkg.hotel_madinah_ar || "N/A")}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1">
                          فندق المدينة <Hotel size={12} className="text-amber-500" />
                        </span>
                      </div>

                      {/* Flight Details */}
                      {pkg.flight && (
                        <div className="flex justify-between items-center text-xs border-t border-slate-200/50 pt-2">
                          <span className="font-semibold text-slate-700">
                            {pkg.flight.airline} ({pkg.flight.flight_number})
                          </span>
                          <span className="text-slate-400 flex items-center gap-1">
                            خطوط الطيران <Plane size={12} className="text-blue-500" />
                          </span>
                        </div>
                      )}

                      {/* Transportation Details */}
                      {pkg.transportation && (
                        <div className="flex justify-between items-center text-xs border-t border-slate-200/50 pt-2">
                          <span className="font-semibold text-slate-700">
                            {pkg.transportation.company} ({pkg.transportation.type})
                          </span>
                          <span className="text-slate-400 flex items-center gap-1">
                            الانتقالات <Car size={12} className="text-emerald-500" />
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-slate-500 text-xs mb-4 line-clamp-2 leading-relaxed text-right">
                      {pkg.description_ar}
                    </p>

                    {/* Features Summary */}
                    {pkg.features_ar && pkg.features_ar.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2 justify-end">
                        {pkg.features_ar.slice(0, 3).map((feat, index) => (
                          <span key={index} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                            ✓ {feat}
                          </span>
                        ))}
                        {pkg.features_ar.length > 3 && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium">
                            +{pkg.features_ar.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-black text-amber-600 text-lg">{pkg.price} EGP</span>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(pkg)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg transition border border-blue-100">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(pkg.id!)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition border border-red-100">
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'Edit Package' : 'Add Hajj/Umrah Package'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Package Name (EN)</label>
                  <input required type="text" value={formData.name_en} onChange={e => setFormData({ ...formData, name_en: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500" placeholder="e.g. Standard Umrah Package" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">اسم البرنامج (AR)</label>
                  <input required type="text" value={formData.name_ar} onChange={e => setFormData({ ...formData, name_ar: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 text-right" placeholder="مثال: برنامج العمرة الاقتصادي" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price (EGP)</label>
                  <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500" placeholder="e.g. 45000" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duration (Days)</label>
                  <input required type="number" value={formData.duration_days} onChange={e => setFormData({ ...formData, duration_days: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500" placeholder="e.g. 14" />
                </div>
              </div>

              {/* Linked Hotels (Makkah & Madinah) */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-150 pt-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Makkah Hotel Link (Optional)</label>
                  <select 
                    value={formData.hotel_makkah_id} 
                    onChange={e => handleHotelSelect("makkah", e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 bg-white font-bold text-slate-700 text-sm"
                  >
                    <option value="">-- Select Makkah Hotel --</option>
                    {hotels.map(h => (
                      <option key={h.id} value={h.id}>{h.title || h.name} ({h.location})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Madinah Hotel Link (Optional)</label>
                  <select 
                    value={formData.hotel_madinah_id} 
                    onChange={e => handleHotelSelect("madinah", e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 bg-white font-bold text-slate-700 text-sm"
                  >
                    <option value="">-- Select Madinah Hotel --</option>
                    {hotels.map(h => (
                      <option key={h.id} value={h.id}>{h.title || h.name} ({h.location})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fallback Hotels text inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Makkah Hotel Name (Fallback EN)</label>
                  <input type="text" value={formData.hotel_makkah_en} onChange={e => setFormData({ ...formData, hotel_makkah_en: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 text-xs" placeholder="e.g. Hilton Suites Makkah" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">اسم فندق مكة (Fallback AR)</label>
                  <input type="text" value={formData.hotel_makkah_ar} onChange={e => setFormData({ ...formData, hotel_makkah_ar: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 text-right text-xs" placeholder="مثال: أجنحة هيلتون مكة" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Madinah Hotel Name (Fallback EN)</label>
                  <input type="text" value={formData.hotel_madinah_en} onChange={e => setFormData({ ...formData, hotel_madinah_en: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 text-xs" placeholder="e.g. Pullman Zamzam Madinah" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">اسم فندق المدينة (Fallback AR)</label>
                  <input type="text" value={formData.hotel_madinah_ar} onChange={e => setFormData({ ...formData, hotel_madinah_ar: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 text-right text-xs" placeholder="مثال: بولمان زمزم المدينة" />
                </div>
              </div>

              {/* Linked Flights & Transportations */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-150 pt-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Flight Link (Optional)</label>
                  <select 
                    value={formData.flight_id} 
                    onChange={e => setFormData({ ...formData, flight_id: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 bg-white font-bold text-slate-700 text-sm"
                  >
                    <option value="">-- Select Flight --</option>
                    {flights.map(f => (
                      <option key={f.id} value={f.id}>{f.airline} ({f.flight_number}): {f.origin} ➔ {f.destination}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Transportation Link (Optional)</label>
                  <select 
                    value={formData.transportation_id} 
                    onChange={e => setFormData({ ...formData, transportation_id: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 bg-white font-bold text-slate-700 text-sm"
                  >
                    <option value="">-- Select Transportation --</option>
                    {transportations.map(t => (
                      <option key={t.id} value={t.id}>{t.company} ({t.type}): {t.route}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-150 pt-3">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Image URL</label>
                <input type="text" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 text-sm" placeholder="https://images.unsplash.com/..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description (EN)</label>
                <textarea required value={formData.description_en} onChange={e => setFormData({ ...formData, description_en: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 h-16 resize-none text-sm" placeholder="Provide package description in English..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">الوصف بالعربية (AR)</label>
                <textarea required value={formData.description_ar} onChange={e => setFormData({ ...formData, description_ar: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 h-16 resize-none text-right text-sm font-sans" placeholder="اكتب تفاصيل ووصف البرنامج باللغة العربية..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Features (EN) - Comma Separated</label>
                <input type="text" value={formData.features_en_raw} onChange={e => setFormData({ ...formData, features_en_raw: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 text-sm" placeholder="e.g. Visa Processing, Flight Ticket, Breakfast, Transfers" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">المميزات والخدمات (AR) - مفصولة بفاصلة</label>
                <input type="text" value={formData.features_ar_raw} onChange={e => setFormData({ ...formData, features_ar_raw: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 text-right text-sm" placeholder="مثال: استخراج التأشيرة, تذاكر الطيران, وجبة الإفطار, الانتقالات" />
              </div>

              <div className="mt-4 flex justify-end gap-3 sticky bottom-0 bg-white pt-4 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg font-bold transition">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition shadow-sm">Save Package</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
