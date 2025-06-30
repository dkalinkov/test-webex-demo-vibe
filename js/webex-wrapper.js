class WebexCalling {
    constructor() {
        this.token = null;
        this.isAuthenticated = false;
        this.webex = null;
        
        this.calling = null;
        this.callingClient = null;     
        this.callingLine = null;   
        this.currentCall = null;
    }

    async initialize() {        
        if (typeof window.Webex === 'undefined') {
            throw new Error('Webex SDK not loaded - please ensure internet connection and CDN access');
        }        
        if (typeof window.Calling === 'undefined') {
            throw new Error('Webex Calling SDK not loaded - please ensure internet connection and CDN access');
        }
    }

    async authenticate(accessToken) {
        if (!accessToken) { throw new Error('Access token is required'); }

        try {
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
            const person = await this.webex.people.get('me');
            this.token = accessToken;

            this.isAuthenticated = true;

            await this.initCalling();
            return person;

        } catch (error) {
            console.error('Authentication failed:', error);
            this.isAuthenticated = false;
            throw new Error(`Authentication failed: ${error.message}`);
        }
    }

    async logout() {
        try {
            this.webex = null;
            this.token = null;
            this.calling = null;

            this.isAuthenticated = false;

        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    getAuthenticationStatus() { return this.isAuthenticated; }

    async initCalling() {
        if (!this.isAuthenticated) {
            throw new Error('Must be authenticated before making calls');
        }

        const webexConfig = {
            config: {
                logger: {
                    level: 'error', // set the desired log level
                },
                meetings: {
                    reconnection: {
                    enabled: true,
                    },
                    enableRtx: true,
                },
                encryption: {
                    kmsInitialTimeout: 8000,
                    kmsMaxTimeout: 40000,
                    batcherMaxCalls: 30,
                    caroots: null,
                },
                dss: {},
            },
            credentials: {
                access_token: this.token
            }
        };

        const callingConfig = {
            clientConfig : {
                calling: true,
                contact: true,
                callHistory: true,
                callSettings: true,
                voicemail: true,
            },
            callingClientConfig: {
                logger: {
                    level: 'error'
                }
            },
            logger: {
                level: 'error'
            }
        }

        this.calling = await Calling.init({ webexConfig, callingConfig });
        this.calling.on('ready', () => {
            this.calling.register().then(() => {
                this.callingClient = this.calling.callingClient;

                this.callingLine = Object.values(this.callingClient.getLines())[0];
                this.callingLine.on('registered', (lineInfo) => {
                    console.log('Line information: ', lineInfo);
                });

                this.callingLine.register();
            });
        });
    }

    async initiateCall(destination) {
        if (!this.isAuthenticated || !this.callingLine) {
            throw new Error('Must be authenticated and calling Line initialized before making calls');
        }

        if (!destination) { throw new Error('Destination is required'); }

        try {            
            const localAudioStream = await Calling.createMicrophoneStream({ audio: true });
            this.currentCall = this.callingLine.makeCall({
                type: 'uri',
                address: destination
            });

            this.currentCall.on('remote_media', (track) => {
                document.getElementById('remote-audio').srcObject = new MediaStream([track]);
            });

            await this.currentCall.dial(localAudioStream);

        } catch (error) {
            throw new Error(`Call failed: ${error.message}`);
        }
    }

    async hangupCall() {
        if (!this.currentCall) {
            throw new Error('No active call to hang up');
        }

        this.currentCall.end();
    }

    getCallStatus() {
        if (!this.currentCall) return 'No active call';        
        return this.currentCall.getStatus();
    }

    hasActiveCall() {
        return this.currentCall !== null && this.currentCall !== undefined;
    }
}

window.WebexCalling = WebexCalling;
