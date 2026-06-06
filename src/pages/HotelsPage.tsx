// @ts-nocheck
import { useEffect, useState, useRef } from "react";
import axiosClient from "../axiosClient";
import { Trash2, Edit, Plus, X, Upload, ImageOff } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "http://127.0.0.1:8000";

/** Resolve any image path returned from the backend to a full URL */
function resolveImage(image: string | null | undefined): string {
  if (!image) return "";
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  // Laravel storage paths: /storage/... or storage/...
  const clean = image.startsWith("/") ? image : `/${image}`;
  return `${API_BASE}${clean}`;
}

export default function HotelsPage() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({
    id: null, name: "", location: "", price: "", rating: "", description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchHotels = () => {
    axiosClient.get("/admin/hotels").then((res) => setHotels(res.data));
  };

  useEffect(() => { fetchHotels(); }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ id: null, name: "", location: "", price: "", rating: "", description: "" });
    setImageFile(null);
    setImagePreview("");
    setIsModalOpen(true);
  };

  const openEditModal = (hotel: any) => {
    setIsEditing(true);
    setFormData({
      id: hotel.id,
      name: hotel.title || hotel.name || "",
      location: hotel.location || "",
      price: hotel.price_starts_from || hotel.ticket_price || hotel.price_range_min || hotel.price || 0,
      rating: hotel.rating || "",
      description: hotel.description || "",
    });
    setImageFile(null);
    setImagePreview(resolveImage(hotel.image));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setImageFile(null);
    setImagePreview("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSaving(true);
    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("location", formData.location);
    submitData.append("price", formData.price);
    submitData.append("rating", formData.rating);
    submitData.append("description", formData.description);
    if (imageFile) {
      submitData.append("image_file", imageFile);
    }

    try {
      const headers = { "Content-Type": "multipart/form-data" };
      if (isEditing) {
        // Use POST + _method=PUT for multipart/form-data (Laravel method spoofing)
        submitData.append("_method", "PUT");
        await axiosClient.post(`/admin/hotels/${formData.id}`, submitData, { headers });
      } else {
        await axiosClient.post(`/admin/hotels`, submitData, { headers });
      }
      closeModal();
      fetchHotels();
    } catch (err) {
      console.error(err);
      alert("Error saving hotel!");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteHotel = async (id: number) => {
    if (confirm("Are you sure you want to delete this hotel?")) {
      await axiosClient.delete(`/admin/hotels/${id}`);
      fetchHotels();
    }
  };

  const uniqueLocations = ["All", ...new Set(hotels.map((item: any) => item.location).filter(Boolean))];
  const filteredItems = selectedLocation === "All" ? hotels : hotels.filter((item: any) => item.location === selectedLocation);
  const groupedHotels = filteredItems.reduce((acc: any, hotel: any) => {
    const loc = hotel.location || "Unknown Location";
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(hotel);
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Manage Hotels</h2>
        <div className="flex gap-4 items-center">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="p-2 border border-slate-200 rounded-lg outline-none bg-white font-medium text-slate-700 shadow-sm"
          >
            {uniqueLocations.map((loc) => (
              <option key={loc as string} value={loc as string}>
                {loc === "All" ? "All Locations" : loc}
              </option>
            ))}
          </select>
          <button
            onClick={openAddModal}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition"
          >
            <Plus size={20} /> Add New Hotel
          </button>
        </div>
      </div>

      {/* Hotels Grid grouped by location */}
      <div className="space-y-12">
        {Object.entries(groupedHotels).map(([locName, locHotels]: [string, any]) => (
          <div key={locName}>
            <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-3">
              <div className="w-2 h-8 bg-amber-500 rounded-full" />
              <h3 className="text-2xl font-bold text-slate-800">{locName}</h3>
              <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {locHotels.length} Hotels
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locHotels.map((hotel: any) => {
                const imgSrc = resolveImage(hotel.image);
                return (
                  <div
                    key={hotel.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 flex flex-col group card-tilt-effect transition-all duration-300"
                  >
                    <div className="card-tilt-inner flex-1 flex flex-col">
                      {/* Hotel image */}
                      <div className="w-full h-48 bg-slate-100 overflow-hidden flex items-center justify-center">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={hotel.title || hotel.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <div className={`flex flex-col items-center gap-2 text-slate-400 ${imgSrc ? "hidden" : ""}`}>
                          <ImageOff size={32} />
                          <span className="text-xs">No image</span>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg text-slate-800 mb-1">{hotel.title || hotel.name}</h3>
                        <p className="text-slate-500 text-sm mb-3 line-clamp-1">{hotel.location}</p>
                        {hotel.rating && (
                          <span className="inline-block px-2 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-md mb-3 self-start">
                            ★ {hotel.rating}
                          </span>
                        )}
                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                          <span className="font-bold text-amber-600">
                            {hotel.price_starts_from || hotel.ticket_price || hotel.price_range_min || hotel.price} EGP
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(hotel)}
                              className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg transition border border-blue-100"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => deleteHotel(hotel.id)}
                              className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition border border-red-100"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {hotels.length === 0 && (
          <p className="text-center text-slate-500 p-8">No hotels found.</p>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
              <h3 className="text-xl font-bold text-slate-800">
                {isEditing ? "Edit Hotel" : "Add New Hotel"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hotel Image</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-full h-48 rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-400 transition-colors cursor-pointer bg-slate-50 overflow-hidden group flex items-center justify-center"
                >
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-semibold text-sm">
                        <Upload size={18} /> Change Image
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Upload size={32} />
                      <span className="text-sm font-medium">Click to upload image</span>
                      <span className="text-xs">PNG, JPG, WEBP up to 5MB</span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {imageFile && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    ✓ {imageFile.name}
                  </p>
                )}
              </div>

              {/* Hotel Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hotel Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                  placeholder="e.g. Hilton Cairo"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location / Address</label>
                <input
                  required
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                  placeholder="e.g. Downtown Cairo"
                />
              </div>

              {/* Price & Rating */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price Starts From (EGP)</label>
                  <input
                    required
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                    placeholder="e.g. 1500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
                  <input
                    type="text"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500"
                    placeholder="e.g. 4.5"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500 resize-none"
                  placeholder="Enter detailed description..."
                />
              </div>

              {/* Actions */}
              <div className="mt-2 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-lg font-bold transition flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Hotel"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
