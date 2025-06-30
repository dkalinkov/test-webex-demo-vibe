// Main App Logic and UI Management
class WebexCallingApp {
    constructor() {
        this.webexCalling = new WebexCalling();
        this.setupEventListeners();
    }

    // Initialize the application
    async initialize() {
        console.log('Initializing Webex Calling Demo App...');
        
        try {
            await this.webexCalling.initialize();
            this.updateStatus('Ready to authenticate');
        } catch (error) {
            this.updateStatus('Error: Webex SDK not loaded');
            console.error('App initialization failed:', error);
        }
    }

    // Set up DOM event listeners
    setupEventListeners() {
        // Smooth scrolling for navigation (updated for Tailwind classes)
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

        // Enter key support for authentication
        const accessTokenInput = document.getElementById('accessToken');
        if (accessTokenInput) {
            accessTokenInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.authenticateWebex();
                }
            });
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
            console.log('Starting authentication process...');
            
            const person = await this.webexCalling.authenticate(accessToken);

            this.updateStatus('Authenticated successfully');
            this.showUserInfo(person);
            console.log('Authentication completed successfully');

        } catch (error) {
            console.error('Authentication error:', error);
            this.updateStatus('Authentication failed');
            
            // Show more detailed error message
            const errorMessage = error.message || 'Authentication failed. Please check your access token.';
            alert(`Authentication failed: ${errorMessage}`);
        }
    }

    // Logout from Webex
    async logoutWebex() {
        try {
            await this.webexCalling.logout();
            this.updateStatus('Logged out');
            this.hideUserInfo();
            document.getElementById('accessToken').value = '';

        } catch (error) {
            console.error('Logout error:', error);
            alert('Error during logout');
        }
    }

    // UI Helper Functions
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
    }

    hideUserInfo() {
        const userInfo = document.getElementById('userInfo');
        const authForm = document.getElementById('authForm');

        if (userInfo) userInfo.classList.add('hidden');
        if (authForm) authForm.classList.remove('hidden');
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
