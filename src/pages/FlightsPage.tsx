// @ts-nocheck
import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { Trash2, Edit, Plus, X, Plane, Calendar, Shield, Users, BadgePercent, DollarSign } from "lucide-react";

export default function FlightsPage() {
  const [flights, setFlights] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAirline, setSelectedAirline] = useState('All');
  
  const [formData, setFormData] = useState<any>({
    id: null,
    airline: "EgyptAir",
    flight_number: "",
    origin: "",
    destination: "",
    departure_time: "",
    arrival_time: "",
    price: "",
    class_type: "Economy",
    available_count: 50,
    image: ""
  });

  const fetchFlight = () => {
    axiosClient.get("/admin/flights")
      .then((res) => setFlights(res.data))
      .catch(err => console.error("Error fetching flights:", err));
  };

  useEffect(() => {
    fetchFlight();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      airline: "EgyptAir",
      flight_number: "",
      origin: "",
      destination: "",
      departure_time: "",
      arrival_time: "",
      price: "",
      class_type: "Economy",
      available_count: 50,
      image: ""
    });
    setIsModalOpen(true);
  };

  const openEditModal = (flight: any) => {
    setIsEditing(true);
    // Format datetime string for input field value (YYYY-MM-DDThh:mm)
    const formatDateTime = (dtStr: string) => {
      if (!dtStr) return "";
      const d = new Date(dtStr);
      if (isNaN(d.getTime())) return dtStr;
      return d.toISOString().slice(0, 16);
    };

    setFormData({ 
      id: flight.id, 
      airline: flight.airline || "EgyptAir", 
      flight_number: flight.flight_number || "",
      origin: flight.origin || "",
      destination: flight.destination || "",
      departure_time: formatDateTime(flight.departure_time),
      arrival_time: formatDateTime(flight.arrival_time),
      price: flight.price || "", 
      class_type: flight.class_type || "Economy",
      available_count: flight.available_count ?? 50,
      image: flight.image || ""
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    // Automatically map fallback carrier logo if image is empty
    let submitData = { ...formData };
    if (!submitData.image) {
      if (submitData.airline === "EgyptAir") submitData.image = "/images/airlines/egyptair.png";
      else if (submitData.airline === "Nile Air") submitData.image = "/images/airlines/nileair.png";
      else submitData.image = "/images/airlines/aircairo.png";
    }

    try {
      if (isEditing) {
        await axiosClient.put(`/admin/flights/${formData.id}`, submitData);
      } else {
        await axiosClient.post(`/admin/flights`, submitData);
      }
      closeModal();
      fetchFlight(); // Solved fetchFlights call bug
    } catch (err) {
      console.error(err);
      alert("Error saving flight!");
    }
  };

  const deleteFlight = async (id: number) => {
    if (confirm("Are you sure you want to delete this Flight?")) {
      await axiosClient.delete(`/admin/flights/${id}`);
      fetchFlight();
    }
  };

  const uniqueAirlines = ['All', ...new Set(flights.map((item: any) => item.airline).filter(Boolean))];
  const filteredFlights = selectedAirline === 'All' ? flights : flights.filter((item: any) => item.airline === selectedAirline);

  return (
    <div className="p-4 md:p-6 bg-slate-50/50 min-h-screen">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
         <div>
            <h2 className="text-3xl font-extrabold text-slate-800 flex items-center gap-2">
               <Plane className="text-amber-500" /> Manage Flight Schedules
            </h2>
            <p className="text-slate-500 text-sm mt-1">Add, edit and monitor airline listings, available seats and seat booking pricing.</p>
         </div>
         <button onClick={openAddModal} className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-xl flex items-center gap-2 font-bold transition shadow-lg shadow-amber-500/20 hover:-translate-y-0.5 duration-200">
            <Plus size={20} /> Add New Flight
         </button>
      </div>

      {/* Filter tab bar */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-slate-200/60">
        {uniqueAirlines.map(airline => (
          <button
            key={airline}
            onClick={() => setSelectedAirline(airline)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition border ${selectedAirline === airline ? 'bg-[#05073C] text-white border-transparent shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            {airline}
          </button>
        ))}
      </div>

      {/* Grid of Flight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFlights.map(flight => (
          <div key={flight.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col group relative card-tilt-effect transition-all duration-300">
            <div className="card-tilt-inner flex-1 flex flex-col">
              {/* Upper carrier banner */}
              <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-850 text-white flex justify-between items-center relative overflow-hidden">
                 <div>
                    <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest block mb-0.5">Carrier</span>
                    <h4 className="font-extrabold text-base leading-tight flex items-center gap-1.5">
                       ✈️ {flight.airline}
                    </h4>
                 </div>
                 <span className="bg-white/10 text-white text-[11px] px-3 py-1.5 rounded-full font-black tracking-wider uppercase backdrop-blur-sm">
                    {flight.flight_number || 'N/A'}
                 </span>
                 <div className="absolute -bottom-8 -right-8 opacity-10 pointer-events-none">
                    <Plane size={96} className="rotate-45" />
                 </div>
              </div>
              
              {/* Core Body info */}
              <div className="p-6 flex-1 flex flex-col space-y-5">
                 {/* Origin & Destination route */}
                 <div className="flex justify-between items-center">
                    <div className="text-left">
                       <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-0.5">Origin</span>
                       <span className="font-black text-slate-700 text-sm">{flight.origin}</span>
                    </div>
                    
                    {/* Arrow vector */}
                    <div className="flex flex-col items-center flex-1 px-4 relative">
                       <div className="w-full h-0.5 bg-slate-200 border-dashed relative">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                             <Plane size={14} className="text-amber-500" />
                          </div>
                       </div>
                       <span className="text-[9px] text-slate-400 font-black mt-2 uppercase tracking-widest">{flight.class_type}</span>
                    </div>
                    
                    <div className="text-right">
                       <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-0.5">Destination</span>
                       <span className="font-black text-slate-700 text-sm">{flight.destination}</span>
                    </div>
                 </div>

                 {/* Date/Times */}
                 <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                       <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Departure</span>
                       <span className="font-bold text-slate-700 block">{flight.departure_time ? new Date(flight.departure_time).toLocaleString('en-EG', {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}) : 'N/A'}</span>
                    </div>
                    <div>
                       <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">Arrival</span>
                       <span className="font-bold text-slate-700 block">{flight.arrival_time ? new Date(flight.arrival_time).toLocaleString('en-EG', {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}) : 'N/A'}</span>
                    </div>
                 </div>

                 {/* Seat allocation & occupied slots */}
                 <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                       <span className="flex items-center gap-1"><Users size={14} className="text-slate-400" /> Available Capacity</span>
                       <span className="text-amber-600">{flight.available_count ?? 50} Seats left</span>
                    </div>
                    {/* Visual Seat Capacity Progress bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                       <div 
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" 
                          style={{ width: `${Math.min(100, ((flight.available_count ?? 50) / 180) * 100)}%` }}
                       ></div>
                    </div>
                 </div>
                 
                 {/* Price, Action controls */}
                 <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                       <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-0.5">Ticket Price</span>
                       <span className="font-black text-amber-600 text-lg">{flight.price} EGP</span>
                    </div>
                    
                    <div className="flex gap-2">
                        <button onClick={() => openEditModal(flight)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2.5 rounded-xl transition border border-blue-100 cursor-pointer">
                           <Edit size={16} />
                        </button>
                        <button onClick={() => deleteFlight(flight.id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2.5 rounded-xl transition border border-red-100 cursor-pointer">
                           <Trash2 size={16} />
                        </button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFlights.length === 0 && (
         <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm max-w-md mx-auto mt-12">
            <Plane size={48} className="text-slate-300 mx-auto mb-3" />
            <h4 className="font-extrabold text-slate-700 text-lg">No Flights found</h4>
            <p className="text-slate-500 text-sm mt-1 mb-5">Click "+ Add New Flight" to register the first real-world flight carrier schedule.</p>
            <button onClick={openAddModal} className="bg-[#05073C] text-white px-4 py-2.5 rounded-xl text-xs font-black hover:bg-[#0c105c]">
               Add First Flight
            </button>
         </div>
      )}

      {/* Modal Popup Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
               <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                   <h3 className="text-lg font-extrabold text-slate-800">{isEditing ? 'Edit Flight Listing' : 'Add New Flight Listing'}</h3>
                   <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition cursor-pointer"><X size={20} /></button>
               </div>
               
               <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-left">
                   {/* Airline Company & Flight Number */}
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Airline Carrier</label>
                           <select 
                              value={formData.airline} 
                              onChange={e => setFormData({...formData, airline: e.target.value})} 
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-semibold text-xs text-slate-700 cursor-pointer"
                           >
                              <option value="EgyptAir">✈️ EgyptAir</option>
                              <option value="Nile Air">✈️ Nile Air</option>
                              <option value="Air Cairo">✈️ Air Cairo</option>
                           </select>
                       </div>
                       <div>
                           <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Flight Number</label>
                           <input 
                              required 
                              type="text" 
                              value={formData.flight_number} 
                              onChange={e => setFormData({...formData, flight_number: e.target.value})} 
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-xs font-semibold text-slate-700" 
                              placeholder="e.g. MS 782" 
                           />
                       </div>
                   </div>
                   
                   {/* Origin & Destination route */}
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Origin</label>
                           <input 
                              required 
                              type="text" 
                              value={formData.origin} 
                              onChange={e => setFormData({...formData, origin: e.target.value})} 
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-xs font-semibold text-slate-700" 
                              placeholder="e.g. Cairo (CAI)" 
                           />
                       </div>
                       <div>
                           <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Destination</label>
                           <input 
                              required 
                              type="text" 
                              value={formData.destination} 
                              onChange={e => setFormData({...formData, destination: e.target.value})} 
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-xs font-semibold text-slate-700" 
                              placeholder="e.g. Luxor (LXR)" 
                           />
                       </div>
                   </div>

                   {/* Departure & Arrival Date Time pickers */}
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Departure Date/Time</label>
                           <input 
                              required 
                              type="datetime-local" 
                              value={formData.departure_time} 
                              onChange={e => setFormData({...formData, departure_time: e.target.value})} 
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-xs font-semibold text-slate-700" 
                           />
                       </div>
                       <div>
                           <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Arrival Date/Time</label>
                           <input 
                              required 
                              type="datetime-local" 
                              value={formData.arrival_time} 
                              onChange={e => setFormData({...formData, arrival_time: e.target.value})} 
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-xs font-semibold text-slate-700" 
                           />
                       </div>
                   </div>
                   
                   {/* Price, Class & Seats */}
                   <div className="grid grid-cols-3 gap-3">
                       <div>
                           <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Price (EGP)</label>
                           <input 
                              required 
                              type="number" 
                              value={formData.price} 
                              onChange={e => setFormData({...formData, price: e.target.value})} 
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-xs font-semibold text-slate-700" 
                              placeholder="2500" 
                           />
                       </div>
                       <div>
                           <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Class</label>
                           <select 
                              value={formData.class_type} 
                              onChange={e => setFormData({...formData, class_type: e.target.value})} 
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-semibold text-xs text-slate-700 cursor-pointer"
                           >
                              <option value="Economy">Economy</option>
                              <option value="Business">Business</option>
                              <option value="First">First Class</option>
                           </select>
                       </div>
                       <div>
                           <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Total Seats</label>
                           <input 
                              required 
                              type="number" 
                              value={formData.available_count} 
                              onChange={e => setFormData({...formData, available_count: e.target.value})} 
                              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-xs font-semibold text-slate-700" 
                              placeholder="50" 
                           />
                       </div>
                   </div>

                   {/* Custom Carrier Logo Image URL */}
                   <div>
                       <label className="block text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Custom Carrier Logo URL (Optional)</label>
                       <input 
                          type="text" 
                          value={formData.image} 
                          onChange={e => setFormData({...formData, image: e.target.value})} 
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-xs text-slate-700" 
                          placeholder="e.g. /images/airlines/egyptair.png" 
                       />
                   </div>

                   {/* Buttons */}
                   <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-slate-100">
                       <button type="button" onClick={closeModal} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition text-xs cursor-pointer">Cancel</button>
                       <button type="submit" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 rounded-xl font-bold transition text-xs cursor-pointer flex items-center justify-center">Save Listing</button>
                   </div>
               </form>
           </div>
        </div>
      )}
    </div>
  );
}
