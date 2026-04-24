const fs = require('fs');

const pages = [
  {file: 'ToursPage.tsx', state: 'tours', singular: 'tour', titleKey: 'title || item.name'},
  {file: 'SafarisPage.tsx', state: 'safaris', singular: 'safari', titleKey: 'title || item.name'},
  {file: 'RestaurantsPage.tsx', state: 'restaurants', singular: 'restaurant', titleKey: 'name'},
  {file: 'MuseumsPage.tsx', state: 'museums', singular: 'museum', titleKey: 'name'},
  {file: 'EventsPage.tsx', state: 'events', singular: 'event', titleKey: 'title || item.name'},
  {file: 'BazaarsPage.tsx', state: 'bazaars', singular: 'bazaar', titleKey: 'name'},
  {file: 'TransportationsPage.tsx', state: 'transportations', singular: 'transportation', titleKey: 'vehicle_name || item.name'}
];

for (let p of pages) {
    let filePath = 'src/pages/' + p.file;
    if (!fs.existsSync(filePath)) continue;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already grouped
    if (content.includes('groupedItems')) continue;

    // 1. Add groupedItems logic
    const groupLogic = `
  const groupedItems = filteredItems.reduce((acc, item) => {
    const loc = item.location || 'Unknown Location';
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(item);
    return acc;
  }, {});

  return (` ;
    
    content = content.replace(/  return \(/, groupLogic);

    // 2. Wrap the grid with the grouping logic
    const gridRegex = /<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">\s*\{filteredItems\.map\(\((.*?)\) => \(/;
    const match = content.match(gridRegex);
    if (match) {
        const paramName = match[1].includes(':') ? match[1].split(':')[0].trim() : match[1].trim(); 
        
        const replaceGrid = `<div className="space-y-12">
         {Object.entries(groupedItems).map(([locName, locItems]) => (
            <div key={locName}>
               <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-3">
                  <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                  <h3 className="text-2xl font-bold text-slate-800">{locName}</h3>
                  <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{locItems.length} Items</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {locItems.map((${paramName}) => (` ;
                  
        content = content.replace(gridRegex, replaceGrid);
        
        const fallbackRegex = /\}\)\}\s*(?:\{.*?\}\s*)?<\/div>/;
        const endReplace = `                  ))}
               </div>
            </div>
         ))}
         {${p.state}.length === 0 && <p className="text-center text-slate-500 p-8">No items found.</p>}
      </div>`;
      
        content = content.replace(fallbackRegex, endReplace);
        fs.writeFileSync(filePath, content);
        console.log('Grouped ' + p.file);
    } else {
        const gridRegexNoParen = /<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">\s*\{filteredItems\.map\((.*?) => \(/;
        const match2 = content.match(gridRegexNoParen);
        if(match2) {
            const paramName = match2[1].trim();
             const replaceGrid = `<div className="space-y-12">
         {Object.entries(groupedItems).map(([locName, locItems]) => (
            <div key={locName}>
               <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-3">
                  <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                  <h3 className="text-2xl font-bold text-slate-800">{locName}</h3>
                  <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{locItems.length} Items</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {locItems.map((${paramName}) => (` ;
                  
            content = content.replace(gridRegexNoParen, replaceGrid);
            
            const endReplace = `                  ))}
               </div>
            </div>
         ))}
         {${p.state}.length === 0 && <p className="text-center text-slate-500 p-8">No items found.</p>}
      </div>`;
            
            const fallbackRegex = /\}\)\}\s*(?:\{.*?\}\s*)?<\/div>/;
            content = content.replace(fallbackRegex, endReplace);
             
            fs.writeFileSync(filePath, content);
            console.log('Grouped ' + p.file);
        }
    }
}
