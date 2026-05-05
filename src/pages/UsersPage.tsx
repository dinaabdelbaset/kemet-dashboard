import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { Trash2, Edit, X, MessageSquare } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, first_name: "", last_name: "", email: "", phone: "", description: "" });

  // CRM Notes States
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [currentUserNotes, setCurrentUserNotes] = useState<any[]>([]);
  const [currentUserBookings, setCurrentUserBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'notes' | 'bookings'>('notes');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newNote, setNewNote] = useState({ content: "", type: "note" });

  const fetchUsers = () => {
    axiosClient.get("/admin/users").then((res) => setUsers(res.data));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (user: any) => {
    setFormData({ 
      id: user.id,
      description: user.description || "", 
      first_name: user.first_name, 
      last_name: user.last_name, 
      email: user.email, 
      phone: user.phone || "" 
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // CRM Notes Functions
  const openNotesModal = async (userId: number) => {
    setSelectedUserId(userId);
    setIsNotesModalOpen(true);
    setActiveTab('notes');
    try {
      const res = await axiosClient.get(`/admin/users/${userId}/notes`);
      setCurrentUserNotes(res.data);
      const resBookings = await axiosClient.get(`/admin/users/${userId}/bookings`);
      setCurrentUserBookings(resBookings.data);
    } catch (err) {
      alert("Error fetching user data");
    }
  };

  const closeNotesModal = () => {
    setIsNotesModalOpen(false);
    setSelectedUserId(null);
    setNewNote({ content: "", type: "note" });
    setCurrentUserNotes([]);
    setCurrentUserBookings([]);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.content.trim()) return;
    try {
      const res = await axiosClient.post(`/admin/users/${selectedUserId}/notes`, newNote);
      setCurrentUserNotes([res.data, ...currentUserNotes]);
      setNewNote({ content: "", type: "note" });
    } catch (err) {
      alert("Error adding note");
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await axiosClient.put(`/admin/users/${formData.id}`, formData);
      closeModal();
      fetchUsers();
    } catch (err) {
      alert("Error saving user!");
    }
  };

  const deleteUser = async (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await axiosClient.delete(`/admin/users/${id}`);
      fetchUsers();
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-slate-800">Manage Users</h2>
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 font-semibold text-slate-600">ID</th>
              <th className="p-4 font-semibold text-slate-600">Name</th>
              <th className="p-4 font-semibold text-slate-600">Email</th>
              <th className="p-4 font-semibold text-slate-600">Phone</th>
              <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                <td className="p-4 text-slate-500">{user.id}</td>
                <td className="p-4 font-medium text-slate-800">{user.first_name} {user.last_name}</td>
                <td className="p-4 text-slate-500">{user.email}</td>
                <td className="p-4 text-slate-500">{user.phone}</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => openNotesModal(user.id)} className="text-emerald-500 hover:text-emerald-700 bg-emerald-50 p-2 rounded-lg" title="CRM History">
                    <MessageSquare size={18} />
                  </button>
                  <button onClick={() => openEditModal(user)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg" title="Edit User">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => deleteUser(user.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg" title="Delete User">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No users found.</td></tr>}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
               <div className="flex justify-between items-center p-6 border-b border-slate-100">
                   <h3 className="text-xl font-bold text-slate-800">Edit User</h3>
                   <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
               </div>
               <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                   <div className="grid grid-cols-2 gap-4">
                       <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                           <input required type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" />
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                           <input required type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" />
                       </div>
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                       <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" />
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                       <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" />
                   </div>
                   
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                       <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="Enter detailed description..."></textarea>
                   </div>
                   <div className="mt-4 flex justify-end gap-3">
                       <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition">Cancel</button>
                       <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition">Save Changes</button>
                   </div>
               </form>
           </div>
        </div>
      )}

      {isNotesModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
               <div className="flex justify-between items-center p-6 border-b border-slate-100">
                   <h3 className="text-xl font-bold text-slate-800">CRM Interaction History</h3>
                   <button onClick={closeNotesModal} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
               </div>
               
               <div className="flex border-b border-slate-200">
                   <button 
                       className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'notes' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                       onClick={() => setActiveTab('notes')}
                   >
                       Notes & History
                   </button>
                   <button 
                       className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'bookings' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                       onClick={() => setActiveTab('bookings')}
                   >
                       User Bookings
                   </button>
               </div>

               <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                   {activeTab === 'notes' ? (
                       currentUserNotes.length === 0 ? (
                           <p className="text-center text-slate-500 py-4">No notes or history found for this user.</p>
                       ) : (
                           <div className="space-y-4">
                               {currentUserNotes.map(note => (
                                   <div key={note.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                       <div className="flex justify-between items-start mb-2">
                                           <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${note.type === 'complaint' ? 'bg-red-100 text-red-700' : note.type === 'conversation' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                                               {note.type}
                                           </span>
                                           <span className="text-xs text-slate-400">{new Date(note.created_at).toLocaleString()}</span>
                                       </div>
                                       <p className="text-slate-700 whitespace-pre-wrap">{note.content}</p>
                                       <p className="text-xs text-slate-400 mt-2 text-right">- {note.admin_name}</p>
                                   </div>
                               ))}
                           </div>
                       )
                   ) : (
                       currentUserBookings.length === 0 ? (
                           <p className="text-center text-slate-500 py-4">No bookings found for this user.</p>
                       ) : (
                           <div className="space-y-4">
                               {currentUserBookings.map(booking => (
                                   <div key={booking.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-2">
                                       <div className="flex justify-between items-center">
                                           <span className="text-sm font-bold text-slate-800">#{booking.id} - <span className="uppercase text-amber-600">{booking.booking_type}</span></span>
                                           <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                                                booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                               {booking.status}
                                           </span>
                                       </div>
                                       <p className="text-sm text-slate-600 font-medium">{booking.item_title}</p>
                                       <div className="flex justify-between items-center mt-2 border-t border-slate-100 pt-2">
                                           <span className="text-xs text-slate-500">{new Date(booking.created_at).toLocaleString()}</span>
                                           <span className="text-sm font-bold text-green-600">{booking.total_price} $</span>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       )
                   )}
               </div>

               {activeTab === 'notes' && (
                   <div className="p-6 border-t border-slate-100 bg-white">
                       <form onSubmit={handleAddNote} className="flex flex-col gap-3">
                           <div className="flex gap-3">
                               <select value={newNote.type} onChange={e => setNewNote({...newNote, type: e.target.value})} className="p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500 bg-white w-1/3">
                                   <option value="note">General Note</option>
                                   <option value="conversation">Conversation</option>
                                   <option value="complaint">Complaint</option>
                               </select>
                           </div>
                           <textarea rows={3} required value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="Add a new note, conversation detail or complaint..."></textarea>
                           <div className="flex justify-end">
                               <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold transition">Add Note</button>
                           </div>
                       </form>
                   </div>
               )}
           </div>
        </div>
      )}
    </div>
  );
}

