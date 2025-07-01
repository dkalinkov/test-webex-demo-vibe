# Cisco Webex Demo

A simple web application that demonstrates Cisco Webex calling and meeting capabilities using the Webex SDK.

## Features

- ✅ **User authentication** with Webex personal access tokens
- ✅ **Voice calling** to phone numbers
- ✅ **Join Webex meetings** with video and audio support
- ✅ **Real-time status updates** for calls and meetings

## Quick Start

1. **Clone or download** this repository
2. **Open the app**:
   ```bash
   # Open index.html directly in your browser
   # Or serve using any static web server
   ```
3. **Get a Webex personal access token**:
   - Go to [Webex Developer Portal](https://developer.webex.com)
   - Copy your personal access token from the Getting Started page
4. **Open the app** in your browser and authenticate with your token

## Technical Details

### Dependencies
- **Webex SDK**: Included JavaScript SDK files for calling and meetings functionality
- **No external build tools** required - works with modern browsers

### Browser Requirements
- Modern browser with WebRTC support
- Camera and microphone permissions for meetings
- Internet connection for Webex services

### File Structure
```
cisco-webex-demo/
├── index.html              # Main HTML file with UI
├── js/
│   ├── webex-wrapper.js    # Webex SDK integration
│   └── app.js              # Application logic and UI management
└── README.md               # This file
```

## Key Features Explained

### Authentication
- Uses Webex SDK with access token authentication
- Registers with Webex calling service
- Displays user information upon successful login

### Calling and Meeting Functionality
- **Voice Calls**: Call phone numbers
- **Meeting Participation**: Join Webex meetings using meeting ID or URL
- **Video Support**: Video and audio available during meetings only
- **Real-time Status**: Live updates for call and meeting states

### UI Components
- **Authentication Section**: User login with personal access token
- **Calling Section**: Make voice calls to phone numbers
- **Meetings Section**: Join meetings with video and audio layout
- **Status Indicators**: Real-time authentication, call, and meeting status

## Browser Requirements

- Modern browser with WebRTC support
- Microphone and camera permissions
- HTTPS required for production (HTTP okay for localhost)

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check if personal access token is valid and not expired
   - Verify internet connection to Webex services
   - Ensure you're using the correct token from the developer portal

2. **Cannot Make Calls**
   - Ensure you're authenticated first
   - Check if the target phone number is valid
   - Verify microphone permissions in browser

3. **Cannot Join Meetings**
   - Verify the meeting ID or URL is correct
   - Ensure you're authenticated before attempting to join
   - Check that the meeting is active and accessible

4. **No Video/Audio**
   - Grant browser permissions for camera and microphone
   - Check if WebRTC is supported in your browser
   - Ensure a secure connection (HTTPS) for production use

### Debug Mode

Open browser developer tools (F12) to see console logs for debugging.

## API Reference

This app uses the [Webex JavaScript SDK](https://webex.github.io/webex-js-sdk/). Key functionality includes:

- **Authentication**: User authentication with personal access tokens
- **Calling**: Voice calls to phone numbers
- **Meetings**: Join Webex meetings with video and audio support
- **Status Management**: Real-time updates for connection and call states

## Support

For issues with:
- **Webex SDK**: Check [Webex Developer Documentation](https://developer.webex.com/docs)
- **This Demo**: Review the code and console logs
- **Webex Services**: Contact Cisco Webex support

## Code Architecture

The application is organized into modular components:

### **webex-wrapper.js** - Core Webex Integration
- `WebexCalling` class that handles all Webex SDK interactions
- Authentication and registration with Webex services
- Calling and meeting functionality
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
