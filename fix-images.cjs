const fs = require('fs');
const path = require('path');
const adminPagesDir = 'e:/اخر تحديث/kemet-admin/src/pages';

const filesToFix = fs.readdirSync(adminPagesDir).filter(f => f.endsWith('Page.tsx'));

filesToFix.forEach(file => {
    let content = fs.readFileSync(path.join(adminPagesDir, file), 'utf8');
    
    // Change localhost:8000 back to localhost:5173 for images
    if (content.includes('localhost:8000')) {
        content = content.replace(/localhost:8000/g, 'localhost:5173');
        fs.writeFileSync(path.join(adminPagesDir, file), content);
        console.log('Fixed image URLs in ' + file);
    }
});
