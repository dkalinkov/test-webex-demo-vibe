const fs = require('fs');
const path = require('path');

// Build script to copy Webex SDK files to lib folder
console.log('🔨 Starting build process...');

// Create lib directory if it doesn't exist
const libDir = path.join(__dirname, 'lib');
if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
    console.log('📁 Created lib directory');
} else {
    console.log('📁 Lib directory already exists');
}

// Check available UMD files
const umdDir = path.join(__dirname, 'node_modules', 'webex', 'umd');
console.log('📋 Checking available UMD files...');

if (fs.existsSync(umdDir)) {
    const umdFiles = fs.readdirSync(umdDir);
    console.log('Available UMD files:', umdFiles);
} else {
    console.log('❌ UMD directory not found');
}

// Source and destination paths - try minified first, then regular
const possibleSources = [
    path.join(__dirname, 'node_modules', 'webex', 'umd', 'webex.min.js'),
    path.join(__dirname, 'node_modules', 'webex', 'umd', 'webex.js'),
    path.join(__dirname, 'node_modules', 'webex', 'dist', 'webex.js')
];

const webexDest = path.join(libDir, 'webex.min.js');
let webexSource = null;

// Find the first available source file
for (const source of possibleSources) {
    if (fs.existsSync(source)) {
        webexSource = source;
        console.log('✅ Found source file:', path.relative(__dirname, source));
        break;
    } else {
        console.log('❌ File not found:', path.relative(__dirname, source));
    }
}

if (!webexSource) {
    console.error('❌ No Webex SDK file found in any expected location!');
    console.log('💡 Available node_modules/webex structure:');
    
    // List the webex package structure for debugging
    const webexPackageDir = path.join(__dirname, 'node_modules', 'webex');
    if (fs.existsSync(webexPackageDir)) {
        function listDir(dir, prefix = '') {
            const items = fs.readdirSync(dir);
            items.forEach(item => {
                const itemPath = path.join(dir, item);
                const stat = fs.statSync(itemPath);
                console.log(`${prefix}${item}${stat.isDirectory() ? '/' : ''}`);
                if (stat.isDirectory() && prefix.length < 6) { // Limit depth
                    listDir(itemPath, prefix + '  ');
                }
            });
        }
        listDir(webexPackageDir);
    }
    process.exit(1);
}

try {
    // Copy main Webex SDK file
    fs.copyFileSync(webexSource, webexDest);
    console.log('✅ Copied to lib/webex.min.js');

    // Get file sizes for reporting
    const webexStats = fs.statSync(webexDest);
    const fileSizeMB = (webexStats.size / (1024 * 1024)).toFixed(2);

    console.log(`📊 Webex SDK file size: ${fileSizeMB} MB`);
    console.log('🎉 Build completed successfully!');
    console.log('💡 Update your HTML to use: <script src="lib/webex.min.js"></script>');

} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}