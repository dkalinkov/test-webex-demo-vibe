class WebexCallingApp {
    constructor() {
        this.webexCalling = new WebexCalling();
        this.setupEventListeners();
        this.setupCallingStatusListener();
        this.setupMeetingStatusListener();
        
        // Device authorization flow state
        this.deviceAuthData = null;
        this.authPollingInterval = null;
    }

    async initialize() {        
        try {
            this.updateStatus('Ready to authenticate');
            this.updateCallStatus('Ready to call (authenticate first)');
        } catch (error) {
            this.updateStatus('Error: Webex SDK not loaded');
            console.error('App initialization failed:', error);
        }
    }

    setupEventListeners() {
        const navLinks = document.querySelectorAll('nav a[href^="#"]');
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
    }

    setupCallingStatusListener() {
        window.addEventListener('callingStatusUpdate', (event) => {
            const status = event.detail.status;
            this.updateCallingStatus(status);
        });
    }

    setupMeetingStatusListener() {
        window.addEventListener('meetingStatusUpdate', (event) => {
            const status = event.detail.status;
            this.updateMeetingStatus(status);
        });
    }

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

    async authenticateWebex() {
        const accessToken = document.getElementById('accessToken').value.trim();

        if (!accessToken) {
            alert('Please enter your access token');
            return;
        }

        await this.authenticateWithToken(accessToken);
    }

    async logoutWebex() {
        try {
            await this.webexCalling.logout();
            this.updateStatus('Logged out');
            this.updateCallingStatus('Not initialized');
            this.updateMeetingStatus('Ready to join');
            this.hideUserInfo();
            this.hideMeetingControls();
            document.getElementById('accessToken').value = '';

        } catch (error) {
            console.error('Logout error:', error);
            alert('Error during logout');
        }
    }

    async initiateCall() {
        if (!this.webexCalling.getAuthenticationStatus()) {
            alert('Please authenticate first before making calls');
            return;
        }

        const destination = document.getElementById('callDestination').value.trim();

        if (!destination) {
            alert('Please enter a phone number or email address to call');
            return;
        }

        try {
            this.updateCallStatus('Initiating call...');
            
            await this.webexCalling.initiateCall(destination);
            
            this.updateCallStatus('Calling...');
            this.showCallControls();
        } catch (error) {
            console.error('Call initiation error:', error);
            this.updateCallStatus('Call failed');
            
            const errorMessage = error.message || 'Failed to initiate call. Please try again.';
            alert(`Call failed: ${errorMessage}`);
        }
    }

    async hangupCall() {
        try {
            this.updateCallStatus('Ending call...');
            await this.webexCalling.hangupCall();
            this.updateCallStatus('Call ended');
            this.hideCallControls();

        } catch (error) {
            console.error('Hangup error:', error);
            this.updateCallStatus('Error ending call');
            alert('Error ending call');
        }
    }

    async joinMeeting() {
        if (!this.webexCalling.getAuthenticationStatus()) {
            alert('Please authenticate first before joining meetings');
            return;
        }

        const meetingId = document.getElementById('meetingId').value.trim();

        if (!meetingId) {
            alert('Please enter a meeting ID or URL');
            return;
        }

        try {
            this.updateMeetingStatus('Joining meeting...');
            await this.webexCalling.joinMeeting(meetingId);
            this.updateMeetingStatus('Connected to meeting');
            this.showMeetingControls();

        } catch (error) {
            console.error('Meeting join error:', error);
            this.updateMeetingStatus('Failed to join meeting');
            const errorMessage = error.message || 'Failed to join meeting. Please try again.';
            alert(`Meeting join failed: ${errorMessage}`);
        }
    }

    async leaveMeeting() {
        try {
            this.updateMeetingStatus('Leaving meeting...');
            await this.webexCalling.leaveMeeting();
            this.updateMeetingStatus('Left meeting');
            this.hideMeetingControls();

        } catch (error) {
            console.error('Leave meeting error:', error);
            this.updateMeetingStatus('Error leaving meeting');
            alert('Error leaving meeting');
        }
    }

    // Device Authorization Flow Methods
    async startDeviceAuth() {
        const clientId = document.getElementById('clientId').value.trim();
        const clientSecret = document.getElementById('clientSecret').value.trim();
        
        if (!clientId) {
            alert('Please enter your integration client ID');
            return;
        }
        
        if (!clientSecret) {
            alert('Please enter your integration client secret');
            return;
        }

        try {
            this.updateStatus('Starting device authorization...');
            
            // Step 1: Request device code
            const response = await fetch('https://webexapis.com/v1/device/authorize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'grant_type': 'grant-type:device_code',
                    'client_id': clientId,
                    'scope': 'spark:all' // Adjust scopes as needed
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error_description || data.error);
            }

            this.deviceAuthData = {
                device_code: data.device_code,
                user_code: data.user_code,
                verification_uri: data.verification_uri,
                verification_uri_complete: data.verification_uri_complete,
                expires_in: data.expires_in,
                interval: data.interval || 5,
                client_id: clientId,
                client_secret: clientSecret
            };

            this.showDeviceCodeSection();
            this.updateStatus('Device authorization started - follow the instructions below');

        } catch (error) {
            console.error('Device authorization error:', error);
            this.updateStatus('Device authorization failed');
            alert(`Device authorization failed: ${error.message}`);
        }
    }

    showDeviceCodeSection() {
        const section = document.getElementById('deviceCodeSection');
        const verificationUri = document.getElementById('verificationUri');
        const userCode = document.getElementById('userCode');
        
        // Show basic verification URL for display
        verificationUri.href = this.deviceAuthData.verification_uri;
        verificationUri.textContent = this.deviceAuthData.verification_uri;
        userCode.textContent = this.deviceAuthData.user_code;
        
        section.classList.remove('hidden');
    }

    openVerificationUrl() {
        // Open the complete verification URL with embedded code for direct verification
        const url = this.deviceAuthData?.verification_uri_complete || this.deviceAuthData?.verification_uri;
        if (url) {
            window.open(url, '_blank');
        }
    }

    async completeDeviceAuth() {
        if (!this.deviceAuthData) {
            alert('No device authorization in progress');
            return;
        }

        try {
            const progressEl = document.getElementById('authProgress');
            progressEl.classList.remove('hidden');
            
            this.updateStatus('Waiting for authorization completion...');

            // Start polling for the access token
            await this.pollForAccessToken();

        } catch (error) {
            console.error('Authorization completion error:', error);
            this.updateStatus('Authorization completion failed');
            alert(`Authorization failed: ${error.message}`);
            
            const progressEl = document.getElementById('authProgress');
            progressEl.classList.add('hidden');
        }
    }

    async pollForAccessToken() {
        const maxAttempts = Math.floor(this.deviceAuthData.expires_in / this.deviceAuthData.interval);
        let attempts = 0;

        return new Promise((resolve, reject) => {
            this.authPollingInterval = setInterval(async () => {
                attempts++;
                
                if (attempts > maxAttempts) {
                    clearInterval(this.authPollingInterval);
                    reject(new Error('Authorization timeout - please try again'));
                    return;
                }

                try {
                    // Create Basic Auth header with client credentials
                    const credentials = btoa(`${this.deviceAuthData.client_id}:${this.deviceAuthData.client_secret}`);
                    
                    const response = await fetch('https://webexapis.com/v1/device/token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Authorization': `Basic ${credentials}`
                        },
                        body: new URLSearchParams({
                            'grant_type': 'urn:ietf:params:oauth:grant-type:device_code',
                            'device_code': this.deviceAuthData.device_code,
                            'client_id': this.deviceAuthData.client_id
                        })
                    });

                    const data = await response.json();

                    if (data.access_token) {
                        // Success! We got the tokens
                        clearInterval(this.authPollingInterval);
                        
                        // Save refresh token to localStorage
                        if (data.refresh_token) {
                            localStorage.setItem('webex_refresh_token', data.refresh_token);
                        }
                        
                        // Fill the access token field
                        document.getElementById('accessToken').value = data.access_token;
                        
                        // Hide device auth section and show success
                        this.cancelDeviceAuth();
                        this.updateStatus('Authorization successful! Access token received');
                        
                        // Automatically authenticate with the new token
                        await this.authenticateWithToken(data.access_token);
                        
                        resolve(data);
                        
                    } else if (data.error === 'authorization_pending') {
                        // Still waiting for user to authorize
                        console.log('Waiting for user authorization...');
                        
                    } else if (data.error === 'slow_down') {
                        // Increase polling interval
                        this.deviceAuthData.interval += 5;
                        
                    } else if (data.error === 'access_denied') {
                        clearInterval(this.authPollingInterval);
                        reject(new Error('Authorization was denied by the user'));
                        
                    } else if (data.error === 'expired_token') {
                        clearInterval(this.authPollingInterval);
                        reject(new Error('Authorization code expired - please start over'));
                        
                    } else {
                        clearInterval(this.authPollingInterval);
                        reject(new Error(data.error_description || data.error || 'Unknown error'));
                    }

                } catch (error) {
                    console.error('Polling error:', error);
                    // Continue polling on network errors
                }
                
            }, this.deviceAuthData.interval * 1000);
        });
    }

    cancelDeviceAuth() {
        if (this.authPollingInterval) {
            clearInterval(this.authPollingInterval);
            this.authPollingInterval = null;
        }
        
        this.deviceAuthData = null;
        
        const section = document.getElementById('deviceCodeSection');
        section.classList.add('hidden');
        
        const progressEl = document.getElementById('authProgress');
        progressEl.classList.add('hidden');
        
        this.updateStatus('Device authorization cancelled');
    }

    async authenticateWithToken(token) {
        try {
            this.updateStatus('Authenticating with token...');
            this.updateCallingStatus('Waiting for authentication...');
            
            const person = await this.webexCalling.authenticate(token);

            this.updateStatus('Authenticated successfully');
            this.showUserInfo(person);

        } catch (error) {
            console.error('Token authentication error:', error);
            this.updateStatus('Authentication failed');
            this.updateCallingStatus('Authentication failed');
            
            const errorMessage = error.message || 'Authentication failed. Please check your access token.';
            alert(`Authentication failed: ${errorMessage}`);
        }
    }

    updateStatus(message) {
        const statusText = document.getElementById('statusText');
        if (statusText) {
            statusText.textContent = message;            
            if (message.includes('success') || message.includes('Authenticated')) {
                statusText.className = 'font-bold text-green-500';
            } else {
                statusText.className = 'font-bold text-red-500';
            }
        }
    }

    updateCallStatus(message) {
        const callStatusText = document.getElementById('callStatusText');
        if (callStatusText) {
            callStatusText.textContent = message;
            
            if (message.includes('connected') || message.includes('Calling')) {
                callStatusText.className = 'font-bold text-green-500';
            } else if (message.includes('failed') || message.includes('Error')) {
                callStatusText.className = 'font-bold text-red-500';
            } else {
                callStatusText.className = 'font-bold text-blue-500';
            }
        }
    }

    updateCallingStatus(message) {
        const callingStatusText = document.getElementById('callingStatusText');
        if (callingStatusText) {
            callingStatusText.textContent = message;
            
            if (message.includes('ready') || message.includes('Ready')) {
                callingStatusText.className = 'font-bold text-green-500';
            } else if (message.includes('failed') || message.includes('Error') || message.includes('timeout')) {
                callingStatusText.className = 'font-bold text-red-500';
            } else if (message.includes('Initializing') || message.includes('Registering') || message.includes('Getting')) {
                callingStatusText.className = 'font-bold text-blue-500';
            } else {
                callingStatusText.className = 'font-bold text-gray-500';
            }
        }
    }

    updateMeetingStatus(message) {
        const meetingStatusText = document.getElementById('meetingStatusText');
        if (meetingStatusText) {
            meetingStatusText.textContent = message;
            
            if (message.includes('Connected') || message.includes('Joined')) {
                meetingStatusText.className = 'font-bold text-green-500';
            } else if (message.includes('failed') || message.includes('Error')) {
                meetingStatusText.className = 'font-bold text-red-500';
            } else {
                meetingStatusText.className = 'font-bold text-blue-500';
            }
        }
    }

    showUserInfo(person) {
        const userInfo = document.getElementById('userInfo');
        const userDetails = document.getElementById('userDetails');
        const authForm = document.getElementById('authForm');

        if (userDetails) {
            userDetails.innerHTML = `
                <p class="mb-2"><strong>Name:</strong> ${person.displayName}</p>
                <p class="mb-2"><strong>Email:</strong> ${person.emails[0]}</p>
                <p class="mb-2"><strong>ID:</strong> ${person.id}</p>
            `;
        }

        if (authForm) authForm.classList.add('hidden');
        if (userInfo) userInfo.classList.remove('hidden');
        
        this.updateCallStatus('Ready to call');
    }

    hideUserInfo() {
        const userInfo = document.getElementById('userInfo');
        const authForm = document.getElementById('authForm');

        if (userInfo) userInfo.classList.add('hidden');
        if (authForm) authForm.classList.remove('hidden');
        
        this.updateCallStatus('Ready to call (authenticate first)');
    }

    showCallControls() {
        const callControls = document.getElementById('callControls');
        const callButton = document.getElementById('callButton');
        const hangupButton = document.getElementById('hangupButton');
        
        if (callControls) callControls.classList.remove('hidden');
        if (callButton) callButton.classList.add('hidden');
        if (hangupButton) hangupButton.classList.remove('hidden');
    }

    hideCallControls() {
        const callControls = document.getElementById('callControls');
        const callButton = document.getElementById('callButton');
        const hangupButton = document.getElementById('hangupButton');
        
        if (callControls) callControls.classList.add('hidden');
        if (callButton) callButton.classList.remove('hidden');
        if (hangupButton) hangupButton.classList.add('hidden');
    }

    showMeetingControls() {
        const joinButton = document.getElementById('joinButton');
        const leaveButton = document.getElementById('leaveButton');
        
        if (joinButton) joinButton.classList.add('hidden');
        if (leaveButton) leaveButton.classList.remove('hidden');
    }

    hideMeetingControls() {
        const joinButton = document.getElementById('joinButton');
        const leaveButton = document.getElementById('leaveButton');
        
        if (joinButton) joinButton.classList.remove('hidden');
        if (leaveButton) leaveButton.classList.add('hidden');
    }

}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Webex app...');
    
    setTimeout(() => {
        console.log('Creating Webex app instance...');
        window.webexApp = new WebexCallingApp();
        window.webexApp.initialize();
    }, 100);
});

window.scrollToAuth = () => window.webexApp.scrollToAuth();
window.authenticateWebex = () => window.webexApp.authenticateWebex();
window.logoutWebex = () => window.webexApp.logoutWebex();
window.initiateCall = () => window.webexApp.initiateCall();
window.hangupCall = () => window.webexApp.hangupCall();
window.joinMeeting = () => window.webexApp.joinMeeting();
window.leaveMeeting = () => window.webexApp.leaveMeeting();
window.startDeviceAuth = () => window.webexApp.startDeviceAuth();
window.completeDeviceAuth = () => window.webexApp.completeDeviceAuth();
window.openVerificationUrl = () => window.webexApp.openVerificationUrl();
window.cancelDeviceAuth = () => window.webexApp.cancelDeviceAuth();
