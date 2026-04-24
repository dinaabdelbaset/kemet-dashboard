const fs = require('fs');
let file = 'src/pages/HotelsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

const startGrid = '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">';
const startIndex = content.indexOf(startGrid);
const modalIndex = content.indexOf('{/* Modal */}');
let endIndex = content.lastIndexOf('</div>', modalIndex);

if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
    let innerContent = content.substring(startIndex + startGrid.length, endIndex);
    innerContent = innerContent.replace(/\{filteredItems\.map\((\w+)\s*=>/, '{locHotels.map($1=>');
    innerContent = innerContent.replace(/\{\s*hotels\.length\s*===\\s*0.*?<p.*?<\/p>\s*\}/, '');

    const newGrid = `<div className="space-y-12">
         {Object.entries(groupedHotels).map(([locName, locHotels]: [string, any]) => (
            <div key={locName}>
               <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-3">
                  <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                  <h3 className="text-2xl font-bold text-slate-800">{locName}</h3>
                  <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{locHotels.length} Hotels</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
` + innerContent + `
               </div>
            </div>
         ))}
         {hotels.length === 0 && <p className="text-center text-slate-500 p-8">No hotels found.</p>}
      </div>`;

    content = content.substring(0, startIndex) + newGrid + content.substring(endIndex + '</div>'.length);

    fs.writeFileSync(file, content);
    console.log("Success");
} else {
    console.log("Failed to find boundaries", startIndex, endIndex, modalIndex);
}
