const fs = require('fs');
let file = 'e:/اخر تحديث/kemet-admin/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add RoomsPage import
if (!content.includes('RoomsPage')) {
    content = content.replace('import HotelsPage from ', 'import RoomsPage from "./pages/RoomsPage";\nimport HotelsPage from ');
}

// Add Rooms Sidebar Link right under Hotels
if (!content.includes('to="/rooms"')) {
    const hotelLinkRegex = /\{\(userRole === 'superadmin' \|\| userRole === 'hotel'\) && <Link to="\/hotels"[^\n]+<\/Link>\}/;
    const roomsLink = '{(userRole === \'superadmin\' || userRole === \'hotel\') && <Link to="/rooms" className="flex items-center gap-3 px-3 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-amber-400 rounded-xl transition-all font-medium"><Bed size={18} /> {userRole === \'hotel\' ? \'My Rooms\' : \'Rooms\'}</Link>}';
    content = content.replace(hotelLinkRegex, '$&\n            ' + roomsLink);
}

// Add Route
if (!content.includes('path="/rooms"')) {
    const hotelRouteRegex = /<Route path="\/hotels" element=\{<HotelsPage \/>\} \/>/;
    const roomsRoute = '<Route path="/rooms" element={<RoomsPage />} />';
    content = content.replace(hotelRouteRegex, '$&\n                ' + roomsRoute);
}

// Add import Bed from lucide-react if not present
if (!content.includes('Bed,')) {
    content = content.replace('import { ', 'import { Bed, ');
}

fs.writeFileSync(file, content);
console.log('App.tsx updated');
