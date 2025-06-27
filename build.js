const fs = require('fs');

console.log('Building Webex Calling Demo...');

// Clean and create dist directory
if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
}

fs.mkdirSync('dist', { recursive: true });
fs.mkdirSync('dist/js', { recursive: true });
fs.mkdirSync('dist/css', { recursive: true });
fs.mkdirSync('dist/lib', { recursive: true });

// Copy files
const files = [
    { from: 'index.html', to: 'dist/index.html' },
    { from: 'styles.css', to: 'dist/css/styles.css' },
    { from: 'js/webex-calling.js', to: 'dist/js/webex-calling.js' },
    { from: 'js/app.js', to: 'dist/js/app.js' },
    { from: 'node_modules/webex/umd/webex.min.js', to: 'dist/lib/webex.min.js' }
];

console.log('Copying files...');
files.forEach(file => {
    if (fs.existsSync(file.from)) {
        fs.copyFileSync(file.from, file.to);
        console.log(`✓ ${file.from} → ${file.to}`);
    } else {
        console.log(`✗ ${file.from} not found`);
    }
});

// Update HTML to use correct paths
console.log('Updating HTML paths...');
let html = fs.readFileSync('dist/index.html', 'utf8');
html = html.replace('node_modules/webex/umd/webex.min.js', 'lib/webex.min.js');
html = html.replace('styles.css', 'css/styles.css');
fs.writeFileSync('dist/index.html', html);

console.log('✅ Build complete! Files are in dist/ folder');
console.log('🚀 Run: npm start');
