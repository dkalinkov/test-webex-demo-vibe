# Cisco Webex Demo

A simple web application that demonstrates Cisco Webex calling and meeting capabilities using the Webex SDK via unpkg CDN.

## Features

- ✅ **User authentication** with Webex access tokens
- ✅ **Voice and video calling** to other Webex users
- ✅ **Join Webex meeting rooms** by ID or URL
- ✅ **Call controls** (mute/unmute, video on/off, hangup)
- ✅ **Real-time call status** updates
- ✅ **No build process** required - uses CDN
- ✅ **Responsive web design**

## Quick Start

1. **Clone or download** this repository
2. **Serve the files** using any static web server:
   ```bash
   # Using the included serve script
   npm run serve
   
   # Or just open index.html in a modern browser
   ```
3. **Get a Webex access token**:
   - Go to [Webex Developer Portal](https://developer.webex.com)
   - Create a new integration
   - Ensure it has these scopes: `spark:people_read`, `spark:calls`, `spark:meetings_write`
   - Copy your access token
4. **Open the app** in your browser and authenticate with your token

## Technical Details

### Dependencies
- **Webex SDK**: Loaded via unpkg CDN
  - Main SDK: `https://unpkg.com/webex@3.8.1/umd/webex.min.js`
  - Version pinned to 3.8.1 for stability

### Browser Requirements
- Modern browser with WebRTC support
- Camera and microphone permissions for video calls
- Internet connection for CDN access

### Security Notes
- Access tokens should be kept secure
- This is a demo app - implement proper token management for production
- Consider using OAuth flow instead of direct token input

### File Structure
```
cisco-webex-demo/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── js/
│   ├── webex-calling.js # Webex SDK integration
│   └── app.js          # UI logic and event handling
├── package.json        # Project metadata (minimal)
└── README.md          # This file
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
