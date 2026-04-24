const fs = require('fs');
const path = require('path');
const adminPagesDir = 'e:/اخر تحديث/kemet-admin/src/pages';

const filesToFix = fs.readdirSync(adminPagesDir).filter(f => f.endsWith('Page.tsx'));

filesToFix.forEach(file => {
    // Skip pages that don't have location or a list
    if (['DashboardPage.tsx', 'ReviewsPage.tsx', 'BookingsPage.tsx', 'UsersPage.tsx', 'TravelPackagesPage.tsx', 'OffersPage.tsx'].includes(file)) return;
    
    let content = fs.readFileSync(path.join(adminPagesDir, file), 'utf8');
    
    // Find the state variable for the main list, e.g. const [hotels, setHotels] = useState<any[]>([]);
    const stateMatch = content.match(/const \[([a-zA-Z]+), set[a-zA-Z]+\] = useState<any\[\]>\(\[\]\);/);
    if (!stateMatch) return;
    
    const itemsVarName = stateMatch[1]; // e.g. hotels, tours, museums
    
    // If it already has selectedLocation, skip
    if (content.includes('selectedLocation')) return;

    // Add state for selected location right after the items state
    content = content.replace(stateMatch[0], `${stateMatch[0]}\n  const [selectedLocation, setSelectedLocation] = useState('All');`);
    
    // Define uniqueLocations and filteredItems just before the return statement
    const filterLogic = `
  const uniqueLocations = ['All', ...new Set(${itemsVarName}.map((item: any) => item.location).filter(Boolean))];
  const filteredItems = selectedLocation === 'All' ? ${itemsVarName} : ${itemsVarName}.filter((item: any) => item.location === selectedLocation);
`;
    content = content.replace(/\s*return \(\s*<div>/m, `\n${filterLogic}\n  return (\n    <div>`);

    // Add the select dropdown UI and replace the button
    const selectHtml = `
         <div className="flex gap-4 items-center">
            <select 
               value={selectedLocation} 
               onChange={(e) => setSelectedLocation(e.target.value)}
               className="p-2 border border-slate-200 rounded-lg outline-none bg-white font-medium text-slate-700 shadow-sm"
            >
               {uniqueLocations.map(loc => <option key={loc as string} value={loc as string}>{loc === 'All' ? 'All Locations' : loc}</option>)}
            </select>
            <button onClick={openAddModal}`;
    content = content.replace(/<button onClick=\{openAddModal\}/, selectHtml);
    
    // Close the new flex div after the button
    content = content.replace(/<\/button>\s*<\/div>/, '</button>\n         </div>\n      </div>');

    // Replace itemsVarName.map with filteredItems.map
    // Careful not to replace inside functions, but usually it's just `{itemsVarName}.map` -> `{filteredItems}.map`
    const regexMap = new RegExp(`\\{${itemsVarName}\\.map\\(`, 'g');
    content = content.replace(regexMap, `{filteredItems.map(`);

    fs.writeFileSync(path.join(adminPagesDir, file), content);
    console.log('Added filters to ' + file);
});
