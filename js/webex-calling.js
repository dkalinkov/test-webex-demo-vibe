// Webex SDK Integration - Authentication Only
class WebexCalling {
    constructor() {
        this.webex = null;
        this.isAuthenticated = false;
    }

    // Initialize Webex SDK
    async initialize() {
        console.log('Initializing Webex Authentication...');
        
        // Check if Webex SDK is loaded from unpkg CDN
        if (typeof window.Webex === 'undefined') {
            console.error('Webex SDK not loaded - check if unpkg CDN is accessible');
            throw new Error('Webex SDK not loaded - please ensure internet connection and CDN access');
        }
        
        console.log('Webex SDK loaded successfully from unpkg CDN');
        console.log('Webex SDK methods available:', Object.keys(window.Webex));
        
        // Check if required methods are available
        if (typeof window.Webex.init !== 'function') {
            console.error('Webex.init method not available');
            throw new Error('Webex SDK incomplete - init method not found');
        }
        
        console.log('Webex version:', window.Webex.version || 'unknown');
        console.log('Webex SDK ready for authentication');
    }

    // Authenticate with Webex
    async authenticate(accessToken) {
        if (!accessToken) {
            throw new Error('Access token is required');
        }

        // Validate token format
        const validation = this.validateToken(accessToken);
        if (!validation.valid) {
            throw new Error(`Invalid token format: ${validation.error}`);
        }

        console.log('Starting authentication with token:', accessToken.substring(0, 20) + '...');

        try {
            // Initialize Webex SDK
            this.webex = window.Webex.init({
                credentials: {
                    access_token: accessToken
                },
                config: {
                    logger: {
                        level: 'info'
                    }
                }
            });

            console.log('Webex SDK initialized, getting user info...');

            // Get user information to validate token
            const person = await this.webex.people.get('me');
            console.log('User info retrieved:', person.displayName, person.emails[0]);

            // Update authentication state
            this.isAuthenticated = true;

            console.log('Authentication successful', person);
            return person;

        } catch (error) {
            console.error('Authentication failed:', error);
            console.error('Error details:', error.message);
            if (error.body) {
                console.error('Error body:', error.body);
            }
            this.isAuthenticated = false;
            
            // Provide more specific error messages
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                throw new Error('Invalid access token. Please check your token and try again.');
            } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
                throw new Error('Access denied. Please ensure your token has the required permissions.');
            } else if (error.message.includes('network') || error.message.includes('fetch')) {
                throw new Error('Network error. Please check your internet connection.');
            } else {
                throw new Error(`Authentication failed: ${error.message}`);
            }
        }
    }

    // Validate token format
    validateToken(accessToken) {
        if (!accessToken || typeof accessToken !== 'string') {
            return { valid: false, error: 'Token must be a non-empty string' };
        }

        // Basic format check for Webex tokens
        // Webex tokens are typically base64-encoded and contain specific patterns
        if (accessToken.length < 50) {
            return { valid: false, error: 'Token appears to be too short' };
        }

        // Check if it looks like a base64 encoded string
        const base64Pattern = /^[A-Za-z0-9+/]+=*$/;
        if (!base64Pattern.test(accessToken.replace(/-/g, '+').replace(/_/g, '/'))) {
            console.warn('Token may not be properly base64 encoded');
        }

        return { valid: true };
    }

    // Logout from Webex
    async logout() {
        try {
            if (this.webex) {
                this.webex = null;
            }

            this.isAuthenticated = false;
            console.log('Logged out successfully');

        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    // Get authentication status
    getAuthenticationStatus() {
        return this.isAuthenticated;
    }
}

// Export for use in other scripts
window.WebexCalling = WebexCalling;
