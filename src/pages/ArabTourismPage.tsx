// @ts-nocheck
import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { Trash2, Edit, Plus, X, Globe, MapPin, Eye, Star } from "lucide-react";

interface ArabCountry {
  id: number;
  name_en: string;
  name_ar: string;
  code: string;
  flag: string;
  image: string;
  description_en?: string;
  description_ar?: string;
  landmarks_count?: number;
}

interface ArabLandmark {
  id: number;
  country_id: number;
  name_en: string;
  name_ar: string;
  location_en: string;
  location_ar: string;
  category: "historical" | "modern" | "nature";
  image: string;
  description_en?: string;
  description_ar?: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  country?: ArabCountry;
}

export default function ArabTourismPage() {
  const [countries, setCountries] = useState<ArabCountry[]>([]);
  const [landmarks, setLandmarks] = useState<ArabLandmark[]>([]);
  const [activeTab, setActiveTab] = useState<"countries" | "landmarks">("countries");
  const [loading, setLoading] = useState(false);

  // Modals state
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [isCountryEditing, setIsCountryEditing] = useState(false);
  const [countryForm, setCountryForm] = useState<any>({
    id: null,
    name_en: "",
    name_ar: "",
    code: "",
    flag: "",
    image: "",
    description_en: "",
    description_ar: ""
  });

  const [isLandmarkModalOpen, setIsLandmarkModalOpen] = useState(false);
  const [isLandmarkEditing, setIsLandmarkEditing] = useState(false);
  const [landmarkForm, setLandmarkForm] = useState<any>({
    id: null,
    country_id: "",
    name_en: "",
    name_ar: "",
    location_en: "",
    location_ar: "",
    category: "historical",
    image: "",
    description_en: "",
    description_ar: "",
    latitude: "",
    longitude: "",
    rating: 4.5
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [countriesRes, landmarksRes] = await Promise.all([
        axiosClient.get("/arab-world/countries"),
        axiosClient.get("/arab-world/landmarks")
      ]);
      setCountries(countriesRes.data);
      setLandmarks(landmarksRes.data);
    } catch (err) {
      console.error("Failed to load Arab Tourism data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Country Handlers
  const openAddCountry = () => {
    setIsCountryEditing(false);
    setCountryForm({
      id: null,
      name_en: "",
      name_ar: "",
      code: "",
      flag: "",
      image: "",
      description_en: "",
      description_ar: ""
    });
    setIsCountryModalOpen(true);
  };

  const openEditCountry = (country: ArabCountry) => {
    setIsCountryEditing(true);
    setCountryForm({ ...country });
    setIsCountryModalOpen(true);
  };

  const handleCountrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isCountryEditing) {
        await axiosClient.put(`/admin/arab-world/countries/${countryForm.id}`, countryForm);
      } else {
        await axiosClient.post("/admin/arab-world/countries", countryForm);
      }
      setIsCountryModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error saving country!");
    }
  };

  const handleCountryDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this country? This will also delete all its associated landmarks.")) {
      try {
        await axiosClient.delete(`/admin/arab-world/countries/${id}`);
        fetchData();
      } catch (err) {
        console.error(err);
        alert("Error deleting country!");
      }
    }
  };

  // Landmark Handlers
  const openAddLandmark = () => {
    setIsLandmarkEditing(false);
    setLandmarkForm({
      id: null,
      country_id: countries[0]?.id || "",
      name_en: "",
      name_ar: "",
      location_en: "",
      location_ar: "",
      category: "historical",
      image: "",
      description_en: "",
      description_ar: "",
      latitude: "",
      longitude: "",
      rating: 4.5
    });
    setIsLandmarkModalOpen(true);
  };

  const openEditLandmark = (landmark: ArabLandmark) => {
    setIsLandmarkEditing(true);
    setLandmarkForm({
      ...landmark,
      latitude: landmark.latitude !== null ? landmark.latitude?.toString() : "",
      longitude: landmark.longitude !== null ? landmark.longitude?.toString() : ""
    });
    setIsLandmarkModalOpen(true);
  };

  const handleLandmarkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...landmarkForm,
      latitude: landmarkForm.latitude ? parseFloat(landmarkForm.latitude) : null,
      longitude: landmarkForm.longitude ? parseFloat(landmarkForm.longitude) : null,
      rating: parseFloat(landmarkForm.rating)
    };

    try {
      if (isLandmarkEditing) {
        await axiosClient.put(`/admin/arab-world/landmarks/${landmarkForm.id}`, submissionData);
      } else {
        await axiosClient.post("/admin/arab-world/landmarks", submissionData);
      }
      setIsLandmarkModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error saving landmark!");
    }
  };

  const handleLandmarkDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this landmark?")) {
      try {
        await axiosClient.delete(`/admin/arab-world/landmarks/${id}`);
        fetchData();
      } catch (err) {
        console.error(err);
        alert("Error deleting landmark!");
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Arab World Tourism Management</h2>
          <p className="text-slate-500 text-sm mt-1">Manage Arab countries and their major tourist landmarks</p>
        </div>

        <div className="flex gap-3">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex gap-1">
            <button
              onClick={() => setActiveTab("countries")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                activeTab === "countries"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Nations (الدول)
            </button>
            <button
              onClick={() => setActiveTab("landmarks")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                activeTab === "landmarks"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Landmarks (المعالم)
            </button>
          </div>

          <button
            onClick={activeTab === "countries" ? openAddCountry : openAddLandmark}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition shadow-sm"
          >
            <Plus size={20} /> Add {activeTab === "countries" ? "Country" : "Landmark"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : activeTab === "countries" ? (
        // Countries Tab Grid
        countries.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-500 font-medium">No countries registered.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {countries.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col group card-tilt-effect transition-all duration-300">
                <div className="card-tilt-inner flex-1 flex flex-col">
                  <div className="relative h-48 overflow-hidden bg-slate-950">
                    <img src={c.image} alt={c.name_en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-xl font-black text-xl shadow-md">
                      {c.flag}
                    </div>
                    <div className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-xl font-bold text-xs shadow-md">
                      {c.code}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-xl text-slate-800 mb-1 flex items-center justify-between">
                        <span>{c.name_ar}</span>
                        <span className="text-sm font-semibold text-slate-400 font-sans">{c.name_en}</span>
                      </h3>
                      {c.description_ar && (
                        <p className="text-slate-500 text-xs mt-3 leading-relaxed text-right line-clamp-2">
                          {c.description_ar}
                        </p>
                      )}
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                      <span className="text-xs font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full">{c.landmarks_count || 0} Landmarks</span>
                      <div className="flex gap-2">
                        <button onClick={() => openEditCountry(c)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg transition border border-blue-100">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleCountryDelete(c.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition border border-red-100">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // Landmarks Tab Grid
        landmarks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-500 font-medium">No landmarks registered.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {landmarks.map((l) => (
              <div key={l.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col group card-tilt-effect transition-all duration-300">
                <div className="card-tilt-inner flex-1 flex flex-col">
                  <div className="relative h-48 overflow-hidden bg-slate-950">
                    <img src={l.image} alt={l.name_en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-xl font-bold text-xs shadow-md flex items-center gap-1">
                      <span>{l.country?.flag}</span>
                      <span>{l.country?.name_ar}</span>
                    </div>
                    <span className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur text-white px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">
                      {l.category}
                    </span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-lg text-slate-800 mb-1 flex items-center justify-between">
                        <span>{l.name_ar}</span>
                        <span className="text-xs font-semibold text-slate-400 font-sans">{l.name_en}</span>
                      </h3>
                      <p className="text-slate-500 text-xs flex items-center gap-1 mb-2 font-semibold">
                        <MapPin size={12} className="text-amber-500" /> {l.location_ar} ({l.location_en})
                      </p>
                      {l.description_ar && (
                        <p className="text-slate-400 text-xs mt-3 leading-relaxed text-right line-clamp-2">
                          {l.description_ar}
                        </p>
                      )}
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                      <span className="text-sm font-bold text-amber-500 flex items-center gap-1">
                        <Star size={14} fill="currentColor" /> {l.rating}
                      </span>
                      <div className="flex gap-2">
                        <button onClick={() => openEditLandmark(l)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg transition border border-blue-100">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleLandmarkDelete(l.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition border border-red-100">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Country Modal */}
      {isCountryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">{isCountryEditing ? 'Edit Country' : 'Add New Country'}</h3>
              <button onClick={() => setIsCountryModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleCountrySubmit} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">English Name</label>
                  <input required type="text" value={countryForm.name_en} onChange={e => setCountryForm({ ...countryForm, name_en: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500" placeholder="e.g. Morocco" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Arabic Name</label>
                  <input required type="text" value={countryForm.name_ar} onChange={e => setCountryForm({ ...countryForm, name_ar: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 text-right" placeholder="مثال: المغرب" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Code (2 Letter)</label>
                  <input required type="text" value={countryForm.code} onChange={e => setCountryForm({ ...countryForm, code: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 uppercase" placeholder="e.g. MA" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Flag Emoji</label>
                  <input required type="text" value={countryForm.flag} onChange={e => setCountryForm({ ...countryForm, flag: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 text-center text-lg" placeholder="e.g. 🇲🇦" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cover Image URL</label>
                <input required type="text" value={countryForm.image} onChange={e => setCountryForm({ ...countryForm, image: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500" placeholder="https://images.unsplash.com/..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">English Description</label>
                <textarea value={countryForm.description_en || ""} onChange={e => setCountryForm({ ...countryForm, description_en: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 h-16 resize-none" placeholder="Enter brief overview in English..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Arabic Description</label>
                <textarea value={countryForm.description_ar || ""} onChange={e => setCountryForm({ ...countryForm, description_ar: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 h-16 resize-none text-right" placeholder="اكتب نبذة مختصرة بالعربية..." />
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsCountryModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg font-bold transition">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition shadow-sm">Save Country</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Landmark Modal */}
      {isLandmarkModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">{isLandmarkEditing ? 'Edit Landmark' : 'Add New Landmark'}</h3>
              <button onClick={() => setIsLandmarkModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleLandmarkSubmit} className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Country Relationship</label>
                <select required value={landmarkForm.country_id} onChange={e => setLandmarkForm({ ...landmarkForm, country_id: parseInt(e.target.value) })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 bg-white font-bold text-slate-700">
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>{c.flag} {c.name_ar} ({c.name_en})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">English Landmark Name</label>
                  <input required type="text" value={landmarkForm.name_en} onChange={e => setLandmarkForm({ ...landmarkForm, name_en: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500" placeholder="e.g. Hassan II Mosque" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Arabic Landmark Name</label>
                  <input required type="text" value={landmarkForm.name_ar} onChange={e => setLandmarkForm({ ...landmarkForm, name_ar: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 text-right" placeholder="مثال: مسجد الحسن الثاني" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                  <select required value={landmarkForm.category} onChange={e => setLandmarkForm({ ...landmarkForm, category: e.target.value as any })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 bg-white font-bold text-slate-700">
                    <option value="historical">Historical (تاريخي)</option>
                    <option value="modern">Modern (حديث)</option>
                    <option value="nature">Nature (طبيعي)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rating</label>
                  <input required type="number" step="0.1" min="1" max="5" value={landmarkForm.rating} onChange={e => setLandmarkForm({ ...landmarkForm, rating: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500" placeholder="4.5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">English Location</label>
                  <input required type="text" value={landmarkForm.location_en} onChange={e => setLandmarkForm({ ...landmarkForm, location_en: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500" placeholder="e.g. Casablanca" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Arabic Location</label>
                  <input required type="text" value={landmarkForm.location_ar} onChange={e => setLandmarkForm({ ...landmarkForm, location_ar: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 text-right" placeholder="مثال: الدار البيضاء" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Latitude (Optional)</label>
                  <input type="text" value={landmarkForm.latitude} onChange={e => setLandmarkForm({ ...landmarkForm, latitude: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500" placeholder="e.g. 33.608" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Longitude (Optional)</label>
                  <input type="text" value={landmarkForm.longitude} onChange={e => setLandmarkForm({ ...landmarkForm, longitude: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500" placeholder="e.g. -7.632" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Landmark Image URL</label>
                <input required type="text" value={landmarkForm.image} onChange={e => setLandmarkForm({ ...landmarkForm, image: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500" placeholder="https://images.unsplash.com/..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">English Description</label>
                <textarea required value={landmarkForm.description_en || ""} onChange={e => setLandmarkForm({ ...landmarkForm, description_en: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 h-16 resize-none" placeholder="Enter landmark details in English..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Arabic Description</label>
                <textarea required value={landmarkForm.description_ar || ""} onChange={e => setLandmarkForm({ ...landmarkForm, description_ar: e.target.value })} className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-amber-500 h-16 resize-none text-right" placeholder="اكتب تفاصيل المعلم السياحي..." />
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsLandmarkModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg font-bold transition">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition shadow-sm">Save Landmark</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
