# Webex Calling Demo

A simple web app that demonstrates Cisco Webex calling using the Webex SDK. Make voice/video calls directly from your browser.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build and run:**
   ```bash
   npm start
   ```

3. **Get a Webex access token:**
   - Go to [developer.webex.com](https://developer.webex.com)
   - Sign in and create an integration
   - Copy your access token

4. **Use the app:**
   - Open http://localhost:3000
   - Enter your access token
   - Enter an email address to call

## Commands

- `npm start` - Build and serve the app
- `npm run build` - Build files to dist/ folder
- `npm run serve` - Just serve the current files
- `npm run clean` - Clean the dist/ folder

## How it works

The build script copies all your files and the Webex SDK library to a `dist/` folder so everything works together without needing node_modules.

## Files

```
├── index.html              # Main page
├── styles.css              # Styling  
├── js/
│   ├── webex-calling.js    # Webex SDK stuff
│   └── app.js              # UI and app logic
├── dist/                   # Built files (generated)
└── build.js                # Simple build script
```

That's it! No docker, no deployment nonsense, just a simple local web app that works.