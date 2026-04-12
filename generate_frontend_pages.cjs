const fs = require('fs');

const models = [
    { name: 'Safari', icon: 'Compass', singleName: 'Safari', pluralName: 'Safaris', endpoint: 'safaris' },
    { name: 'Restaurant', icon: 'Utensils', singleName: 'Restaurant', pluralName: 'Restaurants', endpoint: 'restaurants' },
    { name: 'Museum', icon: 'Landmark', singleName: 'Museum', pluralName: 'Museums', endpoint: 'museums' },
    { name: 'Event', icon: 'Calendar', singleName: 'Event', pluralName: 'Events', endpoint: 'events' },
    { name: 'Bazaar', icon: 'ShoppingBag', singleName: 'Bazaar', pluralName: 'Bazaars', endpoint: 'bazaars' },
    { name: 'Transportation', icon: 'Car', singleName: 'Transport', pluralName: 'Transportation', endpoint: 'transportations' }
];

const template = fs.readFileSync('e:\\اخر تحديث\\kemet-admin\\src\\pages\\ToursPage.tsx', 'utf-8');

models.forEach(model => {
    let content = template.replace(/ToursPage/g, `${model.name}sPage`)
                          .replace(/Tours/g, model.pluralName)
                          .replace(/tours/g, model.endpoint)
                          .replace(/Tour Title/g, `${model.singleName} Name`)
                          .replace(/Tour/g, model.singleName)
                          .replace(/tour\.title/g, `tour.title || tour.name`)
                          .replace(/tour/g, model.name.toLowerCase());

    fs.writeFileSync(`e:\\اخر تحديث\\kemet-admin\\src\\pages\\${model.name}sPage.tsx`, content);
});

// Update App.tsx
let appContent = fs.readFileSync('e:\\اخر تحديث\\kemet-admin\\src\\App.tsx', 'utf-8');

let imports = "";
let routes = "";
let links = "";

models.forEach(model => {
    imports += `// @ts-ignore\nimport ${model.name}sPage from './pages/${model.name}sPage';\n`;
    routes += `             <Route path="/${model.endpoint}" element={<${model.name}sPage />} />\n`;
    links += `            <Link to="/${model.endpoint}" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition">\n              <Building2 size={20} /> ${model.pluralName}\n            </Link>\n`;
});

appContent = appContent.replace("export default function App() {", imports + "export default function App() {");
appContent = appContent.replace("</Routes>", routes + "          </Routes>");
appContent = appContent.replace("</nav>", links + "          </nav>");

fs.writeFileSync('e:\\اخر تحديث\\kemet-admin\\src\\App.tsx', appContent);

console.log('Frontend generated successfully.');
