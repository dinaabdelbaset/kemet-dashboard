import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { Trash2, Edit, Plus, X } from "lucide-react";

export default function MuseumsPage() {
  const [museums, setMuseums] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [formData, setFormData] = useState({ id: null, name: "", location: "", price: "", opening_hours: "", image: "", rating: "" });

  const fetchMuseums = () => {
    axiosClient.get("/admin/museums").then((res) => setMuseums(res.data));
  };

  useEffect(() => {
    fetchMuseums();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ id: null, name: "", location: "", price: "", opening_hours: "", image: "", rating: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (museum: any) => {
    setIsEditing(true);
    setFormData({ 
      id: museum.id, 
      name: museum.name, 
      location: museum.location, 
      price: museum.price || 0, 
      opening_hours: museum.opening_hours || "",
      image: museum.image,
      rating: museum.rating || ""
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axiosClient.put(`/admin/museums/${formData.id}`, formData);
      } else {
        await axiosClient.post(`/admin/museums`, formData);
      }
      closeModal();
      fetchMuseums();
    } catch (err) {
      console.error(err);
      alert("Error saving museum!");
    }
  };

  const deleteMuseum = async (id: number) => {
    if (confirm("Are you sure you want to delete this museum?")) {
      await axiosClient.delete(`/admin/museums/${id}`);
      fetchMuseums();
    }
  };


  const uniqueLocations = ['All', ...new Set(museums.map((item: any) => item.location).filter(Boolean))];
  const filteredItems = selectedLocation === 'All' ? museums : museums.filter((item: any) => item.location === selectedLocation);

  const groupedItems = filteredItems.reduce((acc: any, item: any) => {
    const loc = item.location || 'Unknown Location';
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(item);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
         <h2 className="text-3xl font-bold text-slate-800">Manage Museums</h2>
         <button onClick={openAddModal} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition">
            <Plus size={20} /> Add New Museum
         </button>
      </div>

      <div className="space-y-12">
         {Object.entries(groupedItems).map(([locName, locItems]: [string, any]) => (
            <div key={locName}>
               <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-3">
                  <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                  <h3 className="text-2xl font-bold text-slate-800">{locName}</h3>
                  <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{locItems.length} Items</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

         {locItems.map(museum=> (
            <div key={museum.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 flex flex-col group">
               <img src={museum.image ? (museum.image.startsWith('/') ? 'http://localhost:5173' + museum.image : museum.image) : 'https://via.placeholder.com/400'} alt={museum.name} className="w-full h-48 object-cover" />
               <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-slate-800 mb-1">{museum.name}</h3>
                  <p className="text-slate-500 text-sm mb-2 line-clamp-2" title={museum.location}>{museum.location}</p>
                  
                  {museum.opening_hours && (
                     <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md mb-4 self-start">
                        🕒 {museum.opening_hours}
                     </span>
                  )}
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                     <span className="font-bold text-amber-600">{museum.price} EGP</span>
                     <div className="flex gap-2">
                         <button onClick={() => openEditModal(museum)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg transition border border-blue-100">
                            <Edit size={18} />
                         </button>
                         <button onClick={() => deleteMuseum(museum.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition border border-red-100">
                            <Trash2 size={18} />
                         </button>
                     </div>
                  </div>
               </div>
            </div>
         ))}
         
      
               </div>
            </div>
         ))}
         {museums.length === 0 && <p className="text-center text-slate-500 p-8">No items found.</p>}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
               <div className="flex justify-between items-center p-6 border-b border-slate-100">
                   <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'Edit Museum' : 'Add New Museum'}</h3>
                   <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
               </div>
               <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Museum Name</label>
                       <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. Grand Egyptian Museum" />
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                       <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. Giza" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Price (EGP)</label>
                           <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. 500" />
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Opening Hours</label>
                           <input type="text" value={formData.opening_hours} onChange={e => setFormData({...formData, opening_hours: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. 9 AM - 5 PM" />
                       </div>
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                       <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. /images/GEM.png" />
                   </div>
                   <div className="mt-4 flex justify-end gap-3">
                       <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition">Cancel</button>
                       <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition">Save Museum</button>
                   </div>
               </form>
           </div>
        </div>
      )}
    </div>
  );
}
