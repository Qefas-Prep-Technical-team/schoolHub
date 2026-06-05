const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'frontend', 'src', 'app', 'dashboard', 'admin');
const srcLoading = path.join(adminDir, 'loading.tsx');

if (!fs.existsSync(srcLoading)) {
    console.log("Source loading.tsx not found");
    process.exit(1);
}

const items = fs.readdirSync(adminDir);

items.forEach(item => {
    const itemPath = path.join(adminDir, item);
    if (fs.statSync(itemPath).isDirectory()) {
        const pagePath = path.join(itemPath, 'page.tsx');
        if (fs.existsSync(pagePath)) {
            const destLoading = path.join(itemPath, 'loading.tsx');
            fs.copyFileSync(srcLoading, destLoading);
            console.log(`Copied to ${destLoading}`);
        }
    }
});

fs.unlinkSync(srcLoading);
console.log("Removed original loading.tsx");
