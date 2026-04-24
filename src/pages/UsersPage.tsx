import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { Trash2, Edit, X } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, first_name: "", last_name: "", email: "", phone: "" });

  const fetchUsers = () => {
    axiosClient.get("/admin/users").then((res) => setUsers(res.data));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (user: any) => {
    setFormData({ id: user.id,
      description: user.description || "", first_name: user.first_name, last_name: user.last_name, email: user.email, phone: user.phone || "" });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

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
                  <button onClick={() => openEditModal(user)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg">
                    <Edit size={18} />
                  </button>
                  <button onClick={() => deleteUser(user.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg">
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
    </div>
  );
}
