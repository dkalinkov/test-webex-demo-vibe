class WebexCallingApp {
    constructor() {
        this.webexCalling = new WebexCalling();
        this.setupEventListeners();
        this.setupCallingStatusListener();
    }

    async initialize() {        
        try {
            await this.webexCalling.initialize();
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

        const accessTokenInput = document.getElementById('accessToken');
        if (accessTokenInput) {
            accessTokenInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.authenticateWebex();
                }
            });
        }

        const callDestinationInput = document.getElementById('callDestination');
        if (callDestinationInput) {
            callDestinationInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.initiateCall();
                }
            });
        }
    }

    // Set up listener for calling status updates
    setupCallingStatusListener() {
        window.addEventListener('callingStatusUpdate', (event) => {
            const status = event.detail.status;
            this.updateCallingStatus(status);
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

        try {
            this.updateStatus('Authenticating...');
            this.updateCallingStatus('Waiting for authentication...');
            
            const person = await this.webexCalling.authenticate(accessToken);

            this.updateStatus('Authenticated successfully');
            this.showUserInfo(person);

        } catch (error) {
            console.error('Authentication error:', error);
            this.updateStatus('Authentication failed');
            this.updateCallingStatus('Authentication failed');
            
            // Show more detailed error message
            const errorMessage = error.message || 'Authentication failed. Please check your access token.';
            alert(`Authentication failed: ${errorMessage}`);
        }
    }

    async logoutWebex() {
        try {
            await this.webexCalling.logout();
            this.updateStatus('Logged out');
            this.updateCallingStatus('Not initialized');
            this.hideUserInfo();
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

    // Update calling service status
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

}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Webex app...');
    
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
window.hangupCall = () => window.webexApp.hangupCall();
