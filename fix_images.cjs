const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

files.forEach(file => {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace standard pattern: src={item.image || 'https://via.placeholder.com/400'}
    // and src={hotel.image || hotel.img || 'https://via.placeholder.com/400'}
    content = content.replace(/127\.0\.0\.1:8000/g, 'localhost:5173');

    fs.writeFileSync(filePath, content);
});

console.log("Images fixed!");
