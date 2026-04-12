import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { Trash2, Edit, Plus, X } from "lucide-react";

export default function ToursPage() {
  const [tours, setTours] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: null, title: "", location: "", price: "", duration: "", image: "" });

  const fetchTours = () => {
    axiosClient.get("/admin/tours").then((res) => setTours(res.data));
  };

  useEffect(() => {
    fetchTours();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ id: null, title: "", location: "", price: "", duration: "", image: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (tour: any) => {
    setIsEditing(true);
    setFormData({ 
      id: tour.id, 
      title: tour.title, 
      location: tour.location, 
      price: tour.price, 
      duration: tour.duration || "",
      image: tour.image 
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axiosClient.put(`/admin/tours/${formData.id}`, formData);
      } else {
        await axiosClient.post(`/admin/tours`, formData);
      }
      closeModal();
      fetchTours();
    } catch (err) {
      console.error(err);
      alert("Error saving tour!");
    }
  };

  const deleteTour = async (id: number) => {
    if (confirm("Are you sure you want to delete this tour?")) {
      await axiosClient.delete(`/admin/tours/${id}`);
      fetchTours();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
         <h2 className="text-3xl font-bold text-slate-800">Manage Tours (One Day Trips)</h2>
         <button onClick={openAddModal} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition">
            <Plus size={20} /> Add New Tour
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {tours.map(tour => (
            <div key={tour.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 flex flex-col group">
               <img src={tour.image || 'https://via.placeholder.com/400'} alt={tour.title} className="w-full h-48 object-cover" />
               <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-slate-800 mb-1">{tour.title}</h3>
                  <p className="text-slate-500 text-sm mb-2 line-clamp-2" title={tour.location}>{tour.location}</p>
                  
                  {tour.duration && (
                     <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md mb-4 self-start">
                        {tour.duration}
                     </span>
                  )}
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                     <span className="font-bold text-amber-600">{tour.price} EGP</span>
                     <div className="flex gap-2">
                         <button onClick={() => openEditModal(tour)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg transition border border-blue-100">
                            <Edit size={18} />
                         </button>
                         <button onClick={() => deleteTour(tour.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition border border-red-100">
                            <Trash2 size={18} />
                         </button>
                     </div>
                  </div>
               </div>
            </div>
         ))}
         {tours.length === 0 && <p className="col-span-3 text-center text-slate-500 p-8">No tours found.</p>}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
               <div className="flex justify-between items-center p-6 border-b border-slate-100">
                   <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'Edit Tour' : 'Add New Tour'}</h3>
                   <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
               </div>
               <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Tour Title</label>
                       <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. Pyramids Day Tour" />
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Location / Details</label>
                       <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. Starting from Giza" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Price (EGP)</label>
                           <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. 500" />
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                           <input type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. 8 Hours" />
                       </div>
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                       <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. https://images.unsplash.com/..." />
                   </div>
                   <div className="mt-4 flex justify-end gap-3">
                       <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition">Cancel</button>
                       <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition">Save Tour</button>
                   </div>
               </form>
           </div>
        </div>
      )}
    </div>
  );
}
