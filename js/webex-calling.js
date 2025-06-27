// Webex SDK Integration and Calling Logic
class WebexCalling {
    constructor() {
        this.webex = null;
        this.currentCall = null;
        this.isAuthenticated = false;
        this.isMuted = false;
    }

    // Initialize Webex SDK
    async initialize() {
        console.log('Initializing Webex Calling...');
        
        // Check if Webex SDK is loaded
        if (typeof window.Webex !== 'undefined') {
            console.log('Webex SDK loaded successfully');
            console.log('Webex version:', window.Webex.version || 'version unknown');
            return;
        }
        
        console.error('Webex SDK not loaded');
        throw new Error('Webex SDK not loaded - please refresh the page');
    }

    // Authenticate with Webex
    async authenticate(accessToken) {
        if (!accessToken) {
            throw new Error('Access token is required');
        }

        try {
            // Initialize Webex SDK
            this.webex = window.Webex.init({
                credentials: {
                    access_token: accessToken
                }
            });

            // Register with Webex calling service
            await this.webex.meetings.register();

            // Get user information
            const person = await this.webex.people.get('me');

            // Update authentication state
            this.isAuthenticated = true;

            // Set up call event listeners
            this.setupCallEventListeners();

            console.log('Authentication successful', person);
            return person;

        } catch (error) {
            console.error('Authentication failed:', error);
            this.isAuthenticated = false;
            throw error;
        }
    }

    // Set up call event listeners
    setupCallEventListeners() {
        if (!this.webex) return;

        // Listen for incoming calls
        this.webex.meetings.on('meeting:added', (payload) => {
            const { type, meeting } = payload;
            if (type === 'INCOMING') {
                this.handleIncomingCall(meeting);
            }
        });

        // Listen for call state changes
        this.webex.meetings.on('meeting:stateChanged', (payload) => {
            const { newState, meeting } = payload;
            this.handleCallStateChange(newState, meeting);
        });
    }

    // Handle incoming calls
    handleIncomingCall(meeting) {
        console.log('Incoming call from:', meeting.displayName || 'Unknown');
        this.currentCall = meeting;
        
        // Emit custom event for UI to handle
        const event = new CustomEvent('webex:incomingCall', {
            detail: {
                meeting: meeting,
                caller: meeting.displayName || 'Unknown'
            }
        });
        window.dispatchEvent(event);
    }

    // Handle call state changes
    handleCallStateChange(newState, meeting) {
        console.log('Call state changed:', newState);
        
        // Emit custom event for UI to handle
        const event = new CustomEvent('webex:callStateChanged', {
            detail: {
                state: newState,
                meeting: meeting
            }
        });
        window.dispatchEvent(event);
    }

    // Logout from Webex
    async logout() {
        try {
            if (this.currentCall) {
                await this.hangupCall();
            }

            if (this.webex) {
                await this.webex.meetings.unregister();
                this.webex = null;
            }

            this.isAuthenticated = false;
            console.log('Logged out successfully');

        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    // Initiate a call
    async initiateCall(calleeEmail) {
        if (!calleeEmail) {
            throw new Error('Email address is required');
        }

        if (!this.isAuthenticated) {
            throw new Error('Not authenticated');
        }

        try {
            // Create a meeting
            const meeting = await this.webex.meetings.create(calleeEmail);
            this.currentCall = meeting;

            // Add media
            const mediaSettings = {
                receiveVideo: true,
                receiveAudio: true,
                sendVideo: true,
                sendAudio: true
            };

            // Join the meeting
            await meeting.join(mediaSettings);

            // Get media streams
            const localStream = await meeting.getMediaStreams();
            
            // Emit event with local stream
            const event = new CustomEvent('webex:localStreamReady', {
                detail: { stream: localStream }
            });
            window.dispatchEvent(event);

            console.log('Call initiated successfully');
            return meeting;

        } catch (error) {
            console.error('Call initiation failed:', error);
            this.resetCall();
            throw error;
        }
    }

    // Answer incoming call
    async answerCall() {
        if (!this.currentCall) {
            throw new Error('No active call to answer');
        }

        try {
            const mediaSettings = {
                receiveVideo: true,
                receiveAudio: true,
                sendVideo: true,
                sendAudio: true
            };

            await this.currentCall.join(mediaSettings);

            // Get media streams
            const localStream = await this.currentCall.getMediaStreams();
            
            // Emit event with local stream
            const event = new CustomEvent('webex:localStreamReady', {
                detail: { stream: localStream }
            });
            window.dispatchEvent(event);

            console.log('Call answered successfully');

        } catch (error) {
            console.error('Failed to answer call:', error);
            throw error;
        }
    }

    // Hang up call
    async hangupCall() {
        if (!this.currentCall) {
            return;
        }

        try {
            await this.currentCall.leave();
            this.resetCall();
            console.log('Call ended successfully');

        } catch (error) {
            console.error('Failed to hang up:', error);
            throw error;
        }
    }

    // Toggle mute
    async toggleMute() {
        if (!this.currentCall) {
            throw new Error('No active call');
        }

        try {
            if (this.isMuted) {
                await this.currentCall.unmuteAudio();
                this.isMuted = false;
            } else {
                await this.currentCall.muteAudio();
                this.isMuted = true;
            }

            // Emit mute state change event
            const event = new CustomEvent('webex:muteStateChanged', {
                detail: { isMuted: this.isMuted }
            });
            window.dispatchEvent(event);

            console.log(`Audio ${this.isMuted ? 'muted' : 'unmuted'}`);
            return this.isMuted;

        } catch (error) {
            console.error('Failed to toggle mute:', error);
            throw error;
        }
    }

    // Reset call state
    resetCall() {
        this.currentCall = null;
        this.isMuted = false;

        // Emit call reset event
        const event = new CustomEvent('webex:callReset');
        window.dispatchEvent(event);
    }

    // Get authentication status
    getAuthenticationStatus() {
        return this.isAuthenticated;
    }

    // Get current call status
    getCurrentCall() {
        return this.currentCall;
    }

    // Get mute status
    getMuteStatus() {
        return this.isMuted;
    }
}

// Export for use in other scripts
window.WebexCalling = WebexCalling;
