// Main App Logic and UI Management
class WebexCallingApp {
    constructor() {
        this.webexCalling = new WebexCalling();
        this.setupEventListeners();
        this.setupWebexEventListeners();
    }

    // Initialize the application
    async initialize() {
        console.log('Initializing Webex Calling Demo App...');
        
        try {
            await this.webexCalling.initialize();
            this.updateStatus('Ready to authenticate');
            this.updateCallStatus('Please authenticate first');
        } catch (error) {
            this.updateStatus('Error: Webex SDK not loaded');
            console.error('App initialization failed:', error);
        }
    }

    // Set up DOM event listeners
    setupEventListeners() {
        // Smooth scrolling for navigation
        const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Enter key support for authentication
        const accessTokenInput = document.getElementById('accessToken');
        if (accessTokenInput) {
            accessTokenInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.authenticateWebex();
                }
            });
        }

        // Enter key support for calling
        const calleeEmailInput = document.getElementById('calleeEmail');
        if (calleeEmailInput) {
            calleeEmailInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !document.getElementById('callButton').disabled) {
                    this.initiateCall();
                }
            });
        }
    }

    // Set up Webex event listeners
    setupWebexEventListeners() {
        // Listen for incoming calls
        window.addEventListener('webex:incomingCall', (event) => {
            const { caller } = event.detail;
            this.updateCallStatus(`Incoming call from ${caller}`);
            this.showCallActions();
            document.getElementById('answerButton').style.display = 'inline-block';
            document.getElementById('hangupButton').style.display = 'inline-block';
        });

        // Listen for call state changes
        window.addEventListener('webex:callStateChanged', (event) => {
            const { state } = event.detail;
            this.handleCallStateChange(state);
        });

        // Listen for local stream ready
        window.addEventListener('webex:localStreamReady', (event) => {
            const { stream } = event.detail;
            if (stream && stream.length > 0) {
                document.getElementById('localVideo').srcObject = stream[0];
            }
        });

        // Listen for mute state changes
        window.addEventListener('webex:muteStateChanged', (event) => {
            const { isMuted } = event.detail;
            this.updateMuteButton(isMuted);
        });

        // Listen for call reset
        window.addEventListener('webex:callReset', () => {
            this.resetCallUI();
        });
    }

    // Handle call state changes
    handleCallStateChange(newState) {
        switch (newState) {
            case 'CONNECTED':
                this.updateCallStatus('Call connected');
                this.showCallActions();
                document.getElementById('muteButton').style.display = 'inline-block';
                document.getElementById('hangupButton').style.display = 'inline-block';
                document.getElementById('answerButton').style.display = 'none';
                break;
            case 'DISCONNECTED':
                this.updateCallStatus('Call ended');
                this.hideCallActions();
                break;
            case 'CONNECTING':
                this.updateCallStatus('Connecting...');
                break;
            default:
                this.updateCallStatus(`Call status: ${newState}`);
        }
    }

    // Scroll to authentication section
    scrollToAuth() {
        const authSection = document.querySelector('#auth');
        if (authSection) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = authSection.offsetTop - headerHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    // Authenticate with Webex
    async authenticateWebex() {
        const accessToken = document.getElementById('accessToken').value.trim();

        if (!accessToken) {
            alert('Please enter your access token');
            return;
        }

        try {
            this.updateStatus('Authenticating...');
            const person = await this.webexCalling.authenticate(accessToken);

            this.updateStatus('Authenticated successfully');
            this.showUserInfo(person);
            this.enableCalling();

        } catch (error) {
            this.updateStatus('Authentication failed');
            alert('Authentication failed. Please check your access token.');
        }
    }

    // Logout from Webex
    async logoutWebex() {
        try {
            await this.webexCalling.logout();
            this.updateStatus('Logged out');
            this.hideUserInfo();
            this.disableCalling();
            document.getElementById('accessToken').value = '';

        } catch (error) {
            console.error('Logout error:', error);
            alert('Error during logout');
        }
    }

    // Initiate a call
    async initiateCall() {
        const calleeEmail = document.getElementById('calleeEmail').value.trim();

        if (!calleeEmail) {
            alert('Please enter an email address to call');
            return;
        }

        try {
            this.updateCallStatus('Initiating call...');
            await this.webexCalling.initiateCall(calleeEmail);
            this.updateCallStatus('Calling...');
            this.showCallActions();
            document.getElementById('hangupButton').style.display = 'inline-block';
            document.getElementById('muteButton').style.display = 'inline-block';

        } catch (error) {
            this.updateCallStatus('Call failed');
            alert('Failed to initiate call. Please try again.');
        }
    }

    // Answer incoming call
    async answerCall() {
        try {
            this.updateCallStatus('Answering call...');
            await this.webexCalling.answerCall();

        } catch (error) {
            this.updateCallStatus('Failed to answer call');
            alert('Failed to answer call');
        }
    }

    // Hang up call
    async hangupCall() {
        try {
            this.updateCallStatus('Ending call...');
            await this.webexCalling.hangupCall();

        } catch (error) {
            this.updateCallStatus('Error ending call');
            alert('Error ending call');
        }
    }

    // Toggle mute
    async toggleMute() {
        try {
            await this.webexCalling.toggleMute();
        } catch (error) {
            alert('Failed to toggle mute');
        }
    }

    // UI Helper Functions
    updateStatus(message) {
        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.textContent = message;
            
            if (message.includes('success') || message.includes('Authenticated')) {
                statusText.className = 'authenticated';
            } else {
                statusText.className = '';
            }
        }
    }

    updateCallStatus(message) {
        const callStatusText = document.getElementById('callStatusText');
        if (callStatusText) {
            callStatusText.textContent = message;
        }
    }

    showUserInfo(person) {
        const userInfo = document.getElementById('userInfo');
        const userDetails = document.getElementById('userDetails');
        const authForm = document.getElementById('authForm');

        if (userDetails) {
            userDetails.innerHTML = `
                <p><strong>Name:</strong> ${person.displayName}</p>
                <p><strong>Email:</strong> ${person.emails[0]}</p>
                <p><strong>ID:</strong> ${person.id}</p>
            `;
        }

        if (authForm) authForm.style.display = 'none';
        if (userInfo) userInfo.style.display = 'block';
    }

    hideUserInfo() {
        const userInfo = document.getElementById('userInfo');
        const authForm = document.getElementById('authForm');

        if (userInfo) userInfo.style.display = 'none';
        if (authForm) authForm.style.display = 'block';
    }

    enableCalling() {
        const callButton = document.getElementById('callButton');
        if (callButton) {
            callButton.disabled = false;
        }
        this.updateCallStatus('Ready to call');
    }

    disableCalling() {
        const callButton = document.getElementById('callButton');
        if (callButton) {
            callButton.disabled = true;
        }
        this.updateCallStatus('Please authenticate first');
        this.hideCallActions();
    }

    showCallActions() {
        const callActions = document.getElementById('callActions');
        if (callActions) {
            callActions.style.display = 'flex';
        }
    }

    hideCallActions() {
        const callActions = document.getElementById('callActions');
        if (callActions) {
            callActions.style.display = 'none';
        }
        document.getElementById('answerButton').style.display = 'none';
        document.getElementById('hangupButton').style.display = 'none';
        document.getElementById('muteButton').style.display = 'none';
    }

    updateMuteButton(isMuted) {
        const muteButton = document.getElementById('muteButton');
        if (muteButton) {
            muteButton.textContent = isMuted ? '🔊 Unmute' : '🔇 Mute';
            if (isMuted) {
                muteButton.classList.add('muted');
            } else {
                muteButton.classList.remove('muted');
            }
        }
    }

    resetCallUI() {
        this.hideCallActions();

        // Clear video streams
        const localVideo = document.getElementById('localVideo');
        const remoteVideo = document.getElementById('remoteVideo');
        if (localVideo) localVideo.srcObject = null;
        if (remoteVideo) remoteVideo.srcObject = null;

        // Reset mute button
        this.updateMuteButton(false);
        this.updateCallStatus('Ready to call');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Webex app...');
    
    // Small delay to ensure scripts are loaded
    setTimeout(() => {
        console.log('Creating Webex app instance...');
        window.webexApp = new WebexCallingApp();
        window.webexApp.initialize();
    }, 100);
});

// Global functions for HTML onclick handlers
window.scrollToAuth = () => window.webexApp.scrollToAuth();
window.authenticateWebex = () => window.webexApp.authenticateWebex();
window.logoutWebex = () => window.webexApp.logoutWebex();
window.initiateCall = () => window.webexApp.initiateCall();
window.answerCall = () => window.webexApp.answerCall();
window.hangupCall = () => window.webexApp.hangupCall();
window.toggleMute = () => window.webexApp.toggleMute();
