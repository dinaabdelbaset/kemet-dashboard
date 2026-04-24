const fs = require('fs');
const path = require('path');
const adminPagesDir = 'e:/اخر تحديث/kemet-admin/src/pages';

const filesToFix = fs.readdirSync(adminPagesDir).filter(f => f.endsWith('Page.tsx'));

filesToFix.forEach(file => {
    let content = fs.readFileSync(path.join(adminPagesDir, file), 'utf8');
    let changed = false;

    // 1. Fix {item.name} in JSX
    // It should replace {hotel.name} with {hotel.title || hotel.name}
    content = content.replace(/\{([a-zA-Z0-9_]+)\.name\}/g, '{$1.title || $1.name}');
    
    // 2. Fix {item.price} in JSX
    // It should replace {hotel.price} with {hotel.price_starts_from || hotel.ticket_price || hotel.price_range_min || hotel.price}
    // CAUTION: Ensure it only replaces inside JSX, but since the previous regex /\{(\w+)\.price\}/ broke due to not matching, let's do it safely:
    content = content.replace(/\{([a-zA-Z0-9_]+)\.price\}/g, '{$1.price_starts_from || $1.ticket_price || $1.price_range_min || $1.price}');

    // 3. Fix the mapping in setFormData inside openEditModal
    // Usually it looks like:   name: hotel.name,
    content = content.replace(/name:\s*([a-zA-Z0-9_]+)\.name\s*,/g, 'name: $1.title || $1.name,');
    
    // Usually it looks like:   price: hotel.price,  or price: hotel.price || 0,
    content = content.replace(/price:\s*([a-zA-Z0-9_]+)\.price(\s*\|\|\s*0)?\s*,/g, 'price: $1.price_starts_from || $1.ticket_price || $1.price_range_min || $1.price$2,');

    // Also fix the image URL local mapping
    // It currently maps to localhost:5173, but it should map to localhost:8000
    content = content.replace(/localhost:5173/g, 'localhost:8000');

    if (content !== fs.readFileSync(path.join(adminPagesDir, file), 'utf8')) {
        fs.writeFileSync(path.join(adminPagesDir, file), content);
        console.log('Fixed names and prices in ' + file);
    }
});
