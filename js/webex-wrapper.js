class WebexCalling {
    constructor() {
        this.token = null;
        this.isAuthenticated = false;
        this.webex = null;
        
        this.calling = null;
        this.callingClient = null;     
        this.callingLine = null;   
        this.currentCall = null;
        this.currentMeeting = null;
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
                        level: 'silent' // Set to 'error' for production
                    }
                }
            });
            const person = await this.webex.people.get('me');
            this.token = accessToken;

            this.isAuthenticated = true; 

            await this.initCalling();
            return person;

        } catch (error) {
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
            throw new Error('Must be authenticated before initializing calling');
        }

        try {
            this.notifyCallingStatus('Initializing calling...');

            const webexConfig = {
                config: {
                    logger: {
                        level: 'error',
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
                clientConfig: {
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
            };

            this.calling = await Calling.init({ webexConfig, callingConfig });

            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Calling SDK ready timeout after 30 seconds'));
                }, 30000);

                this.calling.on('ready', async () => {
                    try {
                        clearTimeout(timeout);
                        this.notifyCallingStatus('Registering calling service...');

                        await this.calling.register();
                        this.notifyCallingStatus('Getting calling lines...');

                        this.callingClient = this.calling.callingClient;
                        const lines = this.callingClient.getLines();
                        
                        if (!lines || Object.keys(lines).length === 0) {
                            reject(new Error('No calling lines available. Please check your Webex license.'));
                            return;
                        }

                        this.callingLine = Object.values(lines)[0];
                        this.notifyCallingStatus('Registering calling line...');

                        await new Promise((lineResolve, lineReject) => {
                            const lineTimeout = setTimeout(() => {
                                lineReject(new Error('Line registration timeout'));
                            }, 15000);

                            this.callingLine.on('registered', (lineInfo) => {
                                clearTimeout(lineTimeout);
                                this.notifyCallingStatus('Calling ready!');
                                lineResolve();
                            });

                            this.callingLine.on('error', (error) => {
                                clearTimeout(lineTimeout);
                                lineReject(new Error(`Line registration failed: ${error.message}`));
                            });

                            this.callingLine.register();
                        });

                        resolve();

                    } catch (error) {
                        clearTimeout(timeout);
                        reject(error);
                    }
                });

                this.calling.on('error', (error) => {
                    clearTimeout(timeout);
                    reject(new Error(`Calling SDK error: ${error.message}`));
                });
            });
        } catch (error) {
            this.notifyCallingStatus('Calling initialization failed');
            throw new Error(`Failed to initialize calling: ${error.message}`);
        }
    }

    notifyCallingStatus(status) {        
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('callingStatusUpdate', {
                detail: { status: status }
            }));
        }
    }

    async initiateCall(destination) {
        if (!this.isAuthenticated) {
            throw new Error('Must be authenticated before making calls');
        }

        if (!this.isCallingReady()) {
            throw new Error('Calling service not ready. Please wait for calling line to be registered.');
        }

        if (!destination) { 
            throw new Error('Destination is required'); 
        }

        try {            
            const localAudioStream = await Calling.createMicrophoneStream({ audio: true });
            
            console.log('Making call to:', destination);
            this.currentCall = this.callingLine.makeCall({
                type: 'uri',
                address: destination
            });

            this.currentCall.on('remote_media', (track) => {
                const remoteAudio = document.getElementById('remote-audio');
                if (remoteAudio) {
                    remoteAudio.srcObject = new MediaStream([track]);
                }
            });

            await this.currentCall.dial(localAudioStream);
        } catch (error) {
            this.currentCall = null;
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

    hasActiveCall() { return this.currentCall !== null && this.currentCall !== undefined; }

    isCallingReady() {
        return this.isAuthenticated && 
               this.calling && 
               this.callingClient && 
               this.callingLine;
    }

    async joinMeeting(meetingId) {
        if (!this.isAuthenticated) {
            throw new Error('Must be authenticated before joining meetings');
        }

        if (!meetingId) { throw new Error('Meeting ID is required'); }

        try {
            await this.webex.meetings.register();
            const meeting = await this.webex.meetings.create(meetingId);
            this.currentMeeting = meeting;

            meeting.on('media:ready', () => {
                this.notifyMeetingStatus('Media ready');
            });

            meeting.on('meeting:joined', () => {
                this.notifyMeetingStatus('Joined meeting');
            });

            meeting.on('meeting:left', () => {
                this.notifyMeetingStatus('Left meeting');
                this.currentMeeting = null;
            });

            meeting.on('error', (error) => {
                this.notifyMeetingStatus('Meeting error');
            });

            const microphoneStream = await this.webex.meetings.mediaHelpers.createMicrophoneStream({
                echoCancellation: true,
                noiseSuppression: true,
            });

            const cameraStream = await this.webex.meetings.mediaHelpers.createCameraStream({ width: 640, height: 480 });
            document.getElementById('self-view').srcObject=cameraStream.outputStream;

            // options -> https://developer.webex.com/meeting/docs/sdks/webex-meetings-sdk-web-join-a-meeting#join-a-meeting
            const meetingOptions = {
                pin: '4421',
                moderator: true,
                mediaOptions: {
                    allowMediaInLobby: true,
                    shareAudioEnabled: true,
                    shareVideoEnabled: true,
                    localStreams:{
                        camera:cameraStream,
                        microphone: microphoneStream
                    },
                    receiveAudio: true,
                    receiveVideo: true,
                    receiveShare: false
                },
            };

            meeting.on('media:ready', (media) => {
                console.log(media);
                if (media.type === 'remoteAudio') {
                    let audioElem = document.getElementById('meeting-remote-audio');
                    audioElem.srcObject = media.stream;
                }
                if (media.type === 'remoteVideo') {
                    let videoElem = document.getElementById('meeting-remote-video');
                    videoElem.srcObject = media.stream;
                }
            });

            meeting.on('media:remoteAudio:created', (audioMediaGroup) => {
                console.log(audioMediaGroup);
                // audioMediaGroup.getRemoteMedia().forEach((media, index) => {
                //     document.getElementsByClassName('multistream-remote-audio')[index].srcObject = media.stream;
                // });
            });

            //const { remoteStreams } = 
            await meeting.joinWithMedia(meetingOptions);
            // console.log(remoteStreams);
            // if (remoteStreams && remoteStreams.audio) {
            //     let audioElem = document.getElementById('remote-audio');
            //     audioElem.srcObject = new MediaStream([remoteStreams.audio]);
            // }

            //await meeting.startRecording();

            return meeting;

        } catch (error) {
            this.currentMeeting = null;
            throw new Error(`Failed to join meeting: ${error.message}`);
        }
    }

    async leaveMeeting() {
        if (!this.currentMeeting) {
            throw new Error('No active meeting to leave');
        }

        try {
            await this.currentMeeting.leave();
            this.currentMeeting = null;
            this.notifyMeetingStatus('Left meeting');
        } catch (error) {
            this.currentMeeting = null;
            throw new Error(`Failed to leave meeting: ${error.message}`);
        }
    }

    getMeetingStatus() {
        if (!this.currentMeeting) return 'No active meeting';
        return this.currentMeeting.state || 'Unknown';
    }

    hasActiveMeeting() {
        return this.currentMeeting !== null && this.currentMeeting !== undefined;
    }

    notifyMeetingStatus(status) {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('meetingStatusUpdate', {
                detail: { status: status }
            }));
        }
    }
}

window.WebexCalling = WebexCalling;
