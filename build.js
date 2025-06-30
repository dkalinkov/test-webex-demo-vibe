const fs = require('fs');
const path = require('path');

// Build script to copy Webex SDK files to lib folder
console.log('🔨 Starting build process...');

// Create lib directory if it doesn't exist
const libDir = path.join(__dirname, 'lib');
if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
    console.log('📁 Created lib directory');
}

// Source and destination paths
const webexSource = path.join(__dirname, 'node_modules', 'webex', 'dist', 'webex.js');
const webexDest = path.join(libDir, 'webex.js');

const webexMapSource = path.join(__dirname, 'node_modules', 'webex', 'dist', 'webex.js.map');
const webexMapDest = path.join(libDir, 'webex.js.map');

try {
    // Copy main Webex SDK file
    if (fs.existsSync(webexSource)) {
        fs.copyFileSync(webexSource, webexDest);
        console.log('✅ Copied webex.js to lib/');
    } else {
        console.error('❌ Source file not found:', webexSource);
        process.exit(1);
    }

    // Copy source map file (optional, for debugging)
    if (fs.existsSync(webexMapSource)) {
        fs.copyFileSync(webexMapSource, webexMapDest);
        console.log('✅ Copied webex.js.map to lib/');
    } else {
        console.log('⚠️  Source map file not found (optional):', webexMapSource);
    }

    // Get file sizes for reporting
    const webexStats = fs.statSync(webexDest);
    const fileSizeMB = (webexStats.size / (1024 * 1024)).toFixed(2);

    console.log(`📊 Webex SDK file size: ${fileSizeMB} MB`);
    console.log('🎉 Build completed successfully!');
    console.log('💡 You can now use lib/webex.js instead of node_modules path');
    console.log('� Update your HTML to use: <script src="lib/webex.js"></script>');

} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}
