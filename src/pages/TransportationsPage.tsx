import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { Trash2, Edit, Plus, X } from "lucide-react";

export default function TransportationsPage() {
  const [transportations, setTransportation] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [formData, setFormData] = useState({ id: null, type: "", route: "", company: "", price: "", duration: "", image: "" });

  const fetchTransportation = () => {
    axiosClient.get("/admin/transportations").then((res) => setTransportation(res.data));
  };

  useEffect(() => {
    fetchTransportation();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ id: null, type: "", route: "", company: "", price: "", duration: "", image: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (transportation: any) => {
    setIsEditing(true);
    setFormData({ 
      id: transportation.id, 
      type: transportation.type, 
      route: transportation.route,
      company: transportation.company,
      price: transportation.price, 
      duration: transportation.duration || "",
      image: transportation.image || ""
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axiosClient.put(`/admin/transportations/${formData.id}`, formData);
      } else {
        await axiosClient.post(`/admin/transportations`, formData);
      }
      closeModal();
      fetchTransportation();
    } catch (err) {
      console.error(err);
      alert("Error saving transportation!");
    }
  };

  const deleteTransport = async (id: number) => {
    if (confirm("Are you sure you want to delete this transportation?")) {
      await axiosClient.delete(`/admin/transportations/${id}`);
      fetchTransportation();
    }
  };


  const uniqueLocations = ['All', ...new Set(transportations.map((item: any) => item.location).filter(Boolean))];
  const filteredItems = selectedLocation === 'All' ? transportations : transportations.filter((item: any) => item.location === selectedLocation);

  const groupedItems = filteredItems.reduce((acc: any, item: any) => {
    const loc = item.location || 'Unknown Location';
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(item);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
         <h2 className="text-3xl font-bold text-slate-800">Manage Transportation</h2>
         <button onClick={openAddModal} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition">
            <Plus size={20} /> Add New Transport
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

         {locItems.map(transportation=> (
            <div key={transportation.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 flex flex-col group relative">
               {/* Fixed missing image representation */}
               <div className="w-full h-48 bg-slate-100 flex items-center justify-center relative overflow-hidden">
                  {transportation.image ? (
                     <img 
                        src={transportation.image.startsWith('/') ? 'http://localhost:5173' + transportation.image : transportation.image} 
                        alt={transportation.type} 
                        className="w-full h-full object-cover" 
                     />
                  ) : (
                     <div className="flex flex-col items-center justify-center text-slate-400">
                        <span className="text-4xl">🚐</span>
                        <span className="text-xs font-semibold mt-2 uppercase tracking-wide opacity-50">{transportation.type} Image Missing</span>
                     </div>
                  )}
                  {/* Floating type badge */}
                  <span className="absolute top-3 left-3 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-md">
                     {transportation.type}
                  </span>
               </div>
               
               <div className="p-5 flex-1 flex flex-col">
                  {/* Use route mapping instead of title */}
                  <h3 className="font-bold text-lg text-slate-800 mb-1 leading-tight">{transportation.route}</h3>
                  
                  {/* Using company instead of location */}
                  <p className="text-slate-500 text-sm mb-3 flex items-center gap-1.5">
                     <span className="font-semibold text-slate-600">Operator:</span> {transportation.company || 'Unknown'}
                  </p>
                  
                  {transportation.duration && (
                     <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-md mb-4 self-start border border-amber-100">
                        ⏱ {transportation.duration}
                     </span>
                  )}
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                     <span className="font-bold text-amber-600 text-lg">{transportation.price} EGP</span>
                     <div className="flex gap-2">
                         <button onClick={() => openEditModal(transportation)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg transition border border-blue-100">
                            <Edit size={18} />
                         </button>
                         <button onClick={() => deleteTransport(transportation.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition border border-red-100">
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
         {transportations.length === 0 && <p className="text-center text-slate-500 p-8">No items found.</p>}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
               <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                   <h3 className="text-xl font-extrabold text-slate-800">{isEditing ? 'Edit Transport' : 'Add New Transport'}</h3>
                   <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition"><X size={24} /></button>
               </div>
               <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Type</label>
                           <input required type="text" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-medium" placeholder="Flight, Bus..." />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Operator Company</label>
                           <input required type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-medium" placeholder="e.g. GoBus" />
                       </div>
                   </div>
                   
                   <div>
                       <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Route</label>
                       <input required type="text" value={formData.route} onChange={e => setFormData({...formData, route: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-medium" placeholder="e.g. Cairo -> Luxor" />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Price (EGP)</label>
                           <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-medium" placeholder="450" />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Duration</label>
                           <input type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-medium" placeholder="3h 30m" />
                       </div>
                   </div>
                   <div>
                       <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Image URL (Optional)</label>
                       <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-sm" placeholder="e.g. /images/bus.jpg" />
                   </div>
                   <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-slate-100">
                       <button type="button" onClick={closeModal} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-bold transition">Cancel</button>
                       <button type="submit" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30 rounded-lg font-bold transition flex items-center justify-center">Save Transport</button>
                   </div>
               </form>
           </div>
        </div>
      )}
    </div>
  );
}
