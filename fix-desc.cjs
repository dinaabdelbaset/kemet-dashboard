const fs = require('fs');
const path = require('path');
const adminPagesDir = 'e:/اخر تحديث/kemet-admin/src/pages';

const filesToFix = fs.readdirSync(adminPagesDir).filter(f => f.endsWith('Page.tsx'));

filesToFix.forEach(file => {
    let content = fs.readFileSync(path.join(adminPagesDir, file), 'utf8');
    let changed = false;

    if (file === 'HotelsPage.tsx') return; 

    if (content.includes('setFormData({') && !content.includes('description:')) {
        content = content.replace(/setFormData\(\{([^}]*)id: null,([^}]*)\}\);/, 'setFormData({$1id: null,$2, description: "" });');
        
        content = content.replace(/id: ([a-zA-Z0-9_]+)\.id,/, 'id: $1.id,\n      description: $1.description || "",');

        const textAreaHtml = `
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                       <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-amber-500" placeholder="Enter detailed description..."></textarea>
                   </div>
`;
        content = content.replace(/<div className="mt-4 flex justify-end gap-3">/, textAreaHtml + '                   <div className="mt-4 flex justify-end gap-3">');

        changed = true;
    }

    if (changed) {
        fs.writeFileSync(path.join(adminPagesDir, file), content);
        console.log('Added description to ' + file);
    }
});
