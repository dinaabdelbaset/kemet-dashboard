import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { Trash2, Edit, Plus, X } from "lucide-react";

export default function OffersPage() {
  const [deals, setOffers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: null, title: "", locations: "", price: "", category: "", rating: "", image: "" });

  const fetchOffers = () => {
    axiosClient.get("/admin/deals").then((res) => setOffers(res.data));
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ id: null, title: "", locations: "", price: "", category: "", rating: "", image: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (offer: any) => {
    setIsEditing(true);
    setFormData({ 
      id: offer.id, 
      title: offer.title || offer.name || "", 
      locations: offer.locations || offer.location || "", 
      price: offer.price || "", 
      category: offer.category || "",
      rating: offer.rating || "",
      image: offer.image || ""
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axiosClient.put(`/admin/deals/${formData.id}`, formData);
      } else {
        await axiosClient.post(`/admin/deals`, formData);
      }
      closeModal();
      fetchOffers();
    } catch (err) {
      console.error(err);
      alert("Error saving offer!");
    }
  };

  const deleteOffer = async (id: number) => {
    if (confirm("Are you sure you want to delete this offer?")) {
      await axiosClient.delete(`/admin/deals/${id}`);
      fetchOffers();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
         <h2 className="text-3xl font-bold text-slate-800">Manage Offers (Deals)</h2>
         <button onClick={openAddModal} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition">
            <Plus size={20} /> Add New Offer
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {deals.map(offer => (
            <div key={offer.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 flex flex-col group">
               <img src={offer.image ? (offer.image.startsWith('/') ? 'http://localhost:5173' + offer.image : offer.image) : 'https://via.placeholder.com/400'} alt={offer.title} className="w-full h-48 object-cover" />
               <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                     {offer.category && <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{offer.category}</span>}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 mb-1">{offer.title}</h3>
                  <p className="text-slate-500 text-sm mb-2 line-clamp-2" title={offer.locations}>{offer.locations}</p>
                  
                  {offer.rating && (
                     <span className="inline-block px-2 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-md mb-4 self-start">
                        ★ {offer.rating}
                     </span>
                  )}
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                     <span className="font-bold text-amber-600">{offer.price} EGP</span>
                     <div className="flex gap-2">
                         <button onClick={() => openEditModal(offer)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg transition border border-blue-100">
                            <Edit size={18} />
                         </button>
                         <button onClick={() => deleteOffer(offer.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition border border-red-100">
                            <Trash2 size={18} />
                         </button>
                     </div>
                  </div>
               </div>
            </div>
         ))}
         {deals.length === 0 && <p className="col-span-3 text-center text-slate-500 p-8">No deals found.</p>}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
               <div className="flex justify-between items-center p-6 border-b border-slate-100">
                   <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'Edit Offer' : 'Add New Offer'}</h3>
                   <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
               </div>
               <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Offer Title</label>
                       <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. Pyramids Deal" />
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Locations</label>
                       <input required type="text" value={formData.locations} onChange={e => setFormData({...formData, locations: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. Cairo, Giza" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Price (EGP)</label>
                           <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. 500" />
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
                           <input type="text" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. 4.8" />
                       </div>
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                       <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. Historical" />
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                       <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="e.g. /images/..." />
                   </div>
                   <div className="mt-4 flex justify-end gap-3">
                       <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition">Cancel</button>
                       <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition">Save Offer</button>
                   </div>
               </form>
           </div>
        </div>
      )}
    </div>
  );
}
