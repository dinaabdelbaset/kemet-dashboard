const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace standard pattern: src={item.image || 'https://via.placeholder.com/400'}
    // and src={hotel.image || hotel.img || 'https://via.placeholder.com/400'}
    content = content.replace(/src=\{([a-zA-Z]+)\.image \|\| 'https:\/\/via\.placeholder\.com\/400'\}/g, 
        "src={$1.image ? ($1.image.startsWith('/') ? 'http://127.0.0.1:8000' + $1.image : $1.image) : 'https://via.placeholder.com/400'}");
        
    content = content.replace(/src=\{([a-zA-Z]+)\.image \|\| ([a-zA-Z]+)\.img \|\| 'https:\/\/via\.placeholder\.com\/400'\}/g, 
        "src={$1.image || $2.img ? (($1.image || $2.img).startsWith('/') ? 'http://127.0.0.1:8000' + ($1.image || $2.img) : ($1.image || $2.img)) : 'https://via.placeholder.com/400'}");

    fs.writeFileSync(filePath, content);
});

console.log("Images fixed!");
