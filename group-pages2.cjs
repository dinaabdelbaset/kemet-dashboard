const fs = require('fs');

const pages = [
  {file: 'ToursPage.tsx', state: 'tours'},
  {file: 'SafarisPage.tsx', state: 'safaris'},
  {file: 'RestaurantsPage.tsx', state: 'restaurants'},
  {file: 'MuseumsPage.tsx', state: 'museums'},
  {file: 'EventsPage.tsx', state: 'events'},
  {file: 'BazaarsPage.tsx', state: 'bazaars'},
  {file: 'TransportationsPage.tsx', state: 'transportations'}
];

for (let p of pages) {
    let filePath = 'src/pages/' + p.file;
    if (!fs.existsSync(filePath)) continue;
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('groupedItems')) continue;

    // 1. Insert grouping logic
    const groupLogic = `
  const groupedItems = filteredItems.reduce((acc: any, item: any) => {
    const loc = item.location || 'Unknown Location';
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(item);
    return acc;
  }, {});

  return (` ;
    content = content.replace(/  return \(/, groupLogic);

    // 2. Parse map callback param
    const mapRegex = /\{filteredItems\.map\((.*?)\=\>/;
    const mapMatch = content.match(mapRegex);
    if (!mapMatch) {
        console.log("No map match in " + p.file);
        continue;
    }
    
    let paramStr = mapMatch[1].trim(); // e.g. "tour" or "(tour: any)" or "(item: any)"
    
    // 3. Find the grid start
    const gridStart = content.indexOf('<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">');
    if (gridStart === -1) {
        console.log("No grid start in " + p.file);
        continue;
    }
    
    // 4. Find the end of the grid (right before Modal)
    const modalStart = content.indexOf('{/* Modal */}');
    let gridEnd = content.lastIndexOf('</div>', modalStart);
    if (gridEnd === -1 || gridStart >= gridEnd) {
        console.log("No grid end in " + p.file);
        continue;
    }

    // 5. Build the new grid block
    const innerContent = content.substring(gridStart + '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">'.length, gridEnd);
    
    // The innerContent starts with ` {filteredItems.map(param => (\n`
    // We need to replace the `filteredItems.map` part with `locItems.map`
    let newInnerContent = innerContent.replace(mapRegex, `{locItems.map(${paramStr}=>`);
    
    // Also remove the `{tours.length === 0...}` fallback inside the old grid
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

    fs.writeFileSync(filePath, content);
    console.log('Successfully Grouped ' + p.file);
}
