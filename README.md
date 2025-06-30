# Webex Calling Demo

A web application that demonstrates Cisco Webex calling capabilities using the Webex SDK. This app allows users to authenticate with Webex and make voice/video calls directly from the browser.

## Features

- **Webex Authentication**: Secure login using access tokens
- **Voice & Video Calling**: Make calls to other Webex users
- **Call Controls**: Answer, hang up, and mute functionality
- **Real-time Status**: Live updates on call and authentication status
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### 1. Get Webex Developer Access

1. Go to [Webex Developer Portal](https://developer.webex.com)
2. Sign in with your Webex account (create one if needed)
3. Create a new **Integration** or **Bot**:
   - Click "Start Building Apps"
   - Choose "Create an Integration"
   - Fill in the required details:
     - Integration name: "My Calling Demo"
     - Description: "Demo app for calling"
     - Redirect URI: `http://localhost:3000` (or your domain)
     - Scopes: Select `spark:calls_read`, `spark:calls_write`, `spark:people_read`

### 2. Get Your Access Token

1. In the developer portal, go to your integration
2. Copy the **Client ID** and **Client Secret**
3. For testing, you can use the **Personal Access Token** from your profile
4. **Important**: Personal access tokens expire in 12 hours

### 3. Build the Project

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project (copies SDK files to lib folder):
   ```bash
   npm run build
   ```

### 4. Run the Application

1. Open `index.html` in a web browser
2. Or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

### 4. Use the App

1. **Authenticate**: Enter your access token in the Authentication section
2. **Make a Call**: Enter a Webex user's email address and click "Start Call"
3. **Receive Calls**: The app will automatically detect incoming calls
4. **Control Calls**: Use the answer, hang up, and mute buttons

## File Structure

```
cisco-webex-demo/
├── index.html              # Main HTML file
├── styles.css              # CSS styling
├── js/                     # JavaScript files
│   ├── webex-calling.js    # Webex SDK integration and calling logic
│   └── app.js              # Main app logic and UI management
├── lib/                    # Generated SDK files (created by build script)
│   └── webex.js            # Local copy of Webex SDK
├── build.js                # Build script to copy SDK files
├── package.json            # NPM dependencies and scripts
└── README.md               # This file
```

## Key Features Explained

### Authentication
- Uses Webex SDK with access token authentication
- Registers with Webex calling service
- Displays user information upon successful login

### Calling Functionality
- **Outgoing Calls**: Enter email address to call any Webex user
- **Incoming Calls**: Automatic detection and answer capabilities
- **Video Support**: Local and remote video streams
- **Audio Controls**: Mute/unmute functionality

### UI Components
- **Status Indicators**: Real-time authentication and call status
- **Video Container**: Local and remote video display
- **Call Controls**: Interactive buttons for call management

## Browser Requirements

- Modern browser with WebRTC support
- Microphone and camera permissions
- HTTPS required for production (HTTP okay for localhost)

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check if access token is valid and not expired
   - Ensure correct scopes are selected in developer portal
   - Verify internet connection

2. **Cannot Make Calls**
   - Ensure you're authenticated first
   - Check if the target email is a valid Webex user
   - Verify microphone/camera permissions

3. **No Video/Audio**
   - Grant browser permissions for camera and microphone
   - Check if WebRTC is supported in your browser
   - For production, ensure HTTPS is used

### Debug Mode

Open browser developer tools (F12) to see console logs for debugging.

## API Reference

This app uses the [Webex JavaScript SDK](https://webex.github.io/webex-js-sdk/). Key methods used:

- `Webex.init()` - Initialize SDK
- `webex.meetings.register()` - Register for calling
- `webex.meetings.create()` - Create a meeting/call
- `meeting.join()` - Join a call
- `meeting.leave()` - Leave a call

## Security Notes

- Never expose access tokens in production code
- Use OAuth 2.0 flow for production applications
- Implement proper token refresh mechanisms
- Store sensitive data securely

## Next Steps

To enhance this demo:

1. Implement OAuth 2.0 authentication flow
2. Add screen sharing capabilities
3. Implement group calling
4. Add call recording features
5. Integrate with Webex contact lists

## Support

For issues with:
- **Webex SDK**: Check [Webex Developer Documentation](https://developer.webex.com/docs)
- **This Demo**: Review the code and console logs
- **Webex Services**: Contact Cisco Webex support

## Code Architecture

The application is now organized into modular components:

### **webex-calling.js** - Core Webex Integration
- `WebexCalling` class that handles all Webex SDK interactions
- Authentication and registration with Webex services
- Call management (initiate, answer, hangup, mute)
- Event-driven architecture using custom events
- Isolated from UI concerns for better maintainability

### **app.js** - Application Logic and UI Management
- `WebexCallingApp` class that manages the user interface
- DOM event handling and user interactions
- Webex event listeners for real-time updates
- UI state management and updates
- Global function exports for HTML onclick handlers

### Benefits of This Structure:
- **Separation of Concerns**: Webex logic separated from UI logic
- **Maintainability**: Easier to modify or extend individual components
- **Reusability**: The WebexCalling class can be used in other projects
- **Testing**: Components can be tested independently
- **Event-Driven**: Loose coupling between Webex operations and UI updates

---

Built with ❤️ using Cisco Webex SDK
