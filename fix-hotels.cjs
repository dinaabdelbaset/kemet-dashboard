const fs = require('fs');
let file = 'src/pages/HotelsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredItems.map(hotel => (
            <div key={hotel.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 flex flex-col group">
               <img src={hotel.image ? (hotel.image.startsWith('/') ? 'http://localhost:5173' + hotel.image : hotel.image) : 'https://via.placeholder.com/400'} alt={hotel.title || hotel.name} className="w-full h-48 object-cover" />
               <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-slate-800 mb-1">{hotel.title || hotel.name}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2 cursor-pointer" title={hotel.location}>{hotel.location}</p>
                  
                  {hotel.rating && (
                     <span className="inline-block px-2 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-md mb-4 self-start">
                        ★ {hotel.rating}
                     </span>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                     <span className="font-bold text-amber-600">{hotel.price_starts_from || hotel.ticket_price || hotel.price_range_min || hotel.price} EGP</span>
                     <div className="flex gap-2">
                         <button onClick={() => openEditModal(hotel)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg transition border border-blue-100">
                            <Edit size={18} />
                         </button>
                         <button onClick={() => deleteHotel(hotel.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition border border-red-100">
                            <Trash2 size={18} />
                         </button>
                     </div>
                  </div>
               </div>
            </div>
         ))}
         {hotels.length === 0 && <p className="col-span-3 text-center text-slate-500 p-8">No hotels found.</p>}
      </div>`;

const newStr = `<div className="space-y-12">
         {Object.entries(groupedHotels).map(([locName, locHotels]: [string, any]) => (
            <div key={locName}>
               <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-3">
                  <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                  <h3 className="text-2xl font-bold text-slate-800">{locName}</h3>
                  <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{locHotels.length} Hotels</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {locHotels.map((hotel: any) => (
                     <div key={hotel.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 flex flex-col group">
                        <img src={hotel.image ? (hotel.image.startsWith('/') ? 'http://localhost:5173' + hotel.image : hotel.image) : 'https://via.placeholder.com/400'} alt={hotel.title || hotel.name} className="w-full h-48 object-cover" />
                        <div className="p-5 flex-1 flex flex-col">
                           <h3 className="font-bold text-lg text-slate-800 mb-1">{hotel.title || hotel.name}</h3>
                           <p className="text-slate-500 text-sm mb-4 line-clamp-2 cursor-pointer" title={hotel.location}>{hotel.location}</p>
                           
                           {hotel.rating && (
                              <span className="inline-block px-2 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-md mb-4 self-start">
                                 ★ {hotel.rating}
                              </span>
                           )}

                           <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                              <span className="font-bold text-amber-600">{hotel.price_starts_from || hotel.ticket_price || hotel.price_range_min || hotel.price} EGP</span>
                              <div className="flex gap-2">
                                  <button onClick={() => openEditModal(hotel)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg transition border border-blue-100">
                                     <Edit size={18} />
                                  </button>
                                  <button onClick={() => deleteHotel(hotel.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition border border-red-100">
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
         {hotels.length === 0 && <p className="text-center text-slate-500 p-8">No hotels found.</p>}
      </div>`;

content = content.replace(targetStr, newStr);
fs.writeFileSync(file, content);
