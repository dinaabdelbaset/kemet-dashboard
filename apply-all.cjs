const fs = require('fs');

const pages = [
  {file: 'ToursPage.tsx', state: 'tours', itemName: 'tour'},
  {file: 'SafarisPage.tsx', state: 'safaris', itemName: 'safari'},
  {file: 'RestaurantsPage.tsx', state: 'restaurants', itemName: 'restaurant'},
  {file: 'MuseumsPage.tsx', state: 'museums', itemName: 'museum'},
  {file: 'EventsPage.tsx', state: 'events', itemName: 'event'},
  {file: 'BazaarsPage.tsx', state: 'bazaars', itemName: 'bazaar'},
  {file: 'TransportationsPage.tsx', state: 'transportations', itemName: 'transportation'}
];

for (let p of pages) {
    let filePath = 'src/pages/' + p.file;
    if (!fs.existsSync(filePath)) continue;
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('groupedItems')) continue;

    // 1. Add state for location filter
    if (!content.includes('selectedLocation')) {
        content = content.replace('const [isEditing, setIsEditing] = useState(false);', "const [isEditing, setIsEditing] = useState(false);\n  const [selectedLocation, setSelectedLocation] = useState('All');");
    }

    // 2. Add grouping logic before return
    const groupLogic = `
  const uniqueLocations = ['All', ...new Set(${p.state}.map((item: any) => item.location).filter(Boolean))];
  const filteredItems = selectedLocation === 'All' ? ${p.state} : ${p.state}.filter((item: any) => item.location === selectedLocation);

  const groupedItems = filteredItems.reduce((acc: any, item: any) => {
    const loc = item.location || 'Unknown Location';
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(item);
    return acc;
  }, {});

  return (` ;
    content = content.replace(/  return \(/, groupLogic);

    // 3. Replace the header to add the dropdown
    const headerRegex = new RegExp(`<div className="flex justify-between items-center mb-8">[\\s\\S]*?<h2 className="text-3xl font-bold text-slate-800">(.*?)</h2>[\\s\\S]*?<button onClick=\\{openAddModal\\}[\\s\\S]*?<Plus size=\\{20\\} />(.*?)<\\/button>[\\s\\S]*?<\\/div>`);
    const headerMatch = content.match(headerRegex);
    if (headerMatch) {
        const title = headerMatch[1];
        const btnText = headerMatch[2].trim();
        const newHeader = `<div className="flex justify-between items-center mb-8">
         <h2 className="text-3xl font-bold text-slate-800">${title}</h2>
         
         <div className="flex gap-4 items-center">
            <select 
               value={selectedLocation} 
               onChange={(e) => setSelectedLocation(e.target.value)}
               className="p-2 border border-slate-200 rounded-lg outline-none bg-white font-medium text-slate-700 shadow-sm"
            >
               {uniqueLocations.map(loc => <option key={loc as string} value={loc as string}>{loc === 'All' ? 'All Locations' : loc}</option>)}
            </select>
            <button onClick={openAddModal} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition">
               <Plus size={20} /> ${btnText}
            </button>
         </div>
      </div>`;
        content = content.replace(headerRegex, newHeader);
    }

    // 4. Find the map callback param
    const mapRegex = new RegExp(`\\{${p.state}\\.map\\((.*?)=>`);
    const mapMatch = content.match(mapRegex);
    if (!mapMatch) {
        console.log("No map match in " + p.file);
        continue;
    }
    let paramStr = mapMatch[1].trim();

    // 5. Replace the grid
    const gridStart = content.indexOf('<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">');
    const modalStart = content.indexOf('{/* Modal */}');
    let gridEnd = content.lastIndexOf('</div>', modalStart);
    
    if (gridStart !== -1 && gridEnd !== -1) {
        let innerContent = content.substring(gridStart + '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">'.length, gridEnd);
        
        let newInnerContent = innerContent.replace(mapRegex, `{locItems.map(${paramStr}=>`);
        newInnerContent = newInnerContent.replace(new RegExp(`\\{\\s*${p.state}\\.length\\s*===\\s*0.*?<p.*?</p>\\s*\\}`), '');
        
        const newGridBlock = `<div className="space-y-12">
         {Object.entries(groupedItems).map(([locName, locItems]: [string, any]) => (
            <div key={locName}>
               <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-3">
                  <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                  <h3 className="text-2xl font-bold text-slate-800">{locName}</h3>
                  <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{locItems.length} Items</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
` + newInnerContent + `
               </div>
            </div>
         ))}
         {${p.state}.length === 0 && <p className="text-center text-slate-500 p-8">No items found.</p>}
      </div>`;

        content = content.substring(0, gridStart) + newGridBlock + content.substring(gridEnd + '</div>'.length);
    }
    
    fs.writeFileSync(filePath, content);
    console.log('Successfully applied to ' + p.file);
}
