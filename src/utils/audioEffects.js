// Web Audio API Synthesizer for POS System Sounds

class SoundEffects {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(freq, type, duration, gainValue = 0.1) {
        if (!this.enabled) return;
        try {
            this.init();
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            
            gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            // Audio policy or silence
        }
    }

    // Sound when item is added to cart
    beep() {
        this.playTone(880, 'sine', 0.08, 0.15); // A5 crisp beep
    }

    // Sound when quantity removed or decreased
    subBeep() {
        this.playTone(440, 'triangle', 0.08, 0.12);
    }

    // Cash register "cha-ching" on successful sale
    cashRegister() {
        if (!this.enabled) return;
        try {
            this.init();
            if (!this.ctx) return;
            
            this.playTone(1046.5, 'sine', 0.12, 0.2); // C6
            setTimeout(() => {
                this.playTone(1318.5, 'sine', 0.15, 0.2); // E6
            }, 80);
            setTimeout(() => {
                this.playTone(1567.98, 'sine', 0.25, 0.25); // G6
                this.playTone(2093.00, 'triangle', 0.35, 0.15); // C7
            }, 160);
        } catch (e) {
            // ignore
        }
    }

    // Success sound for general actions
    success() {
        this.playTone(587.33, 'sine', 0.1, 0.15);
        setTimeout(() => this.playTone(880, 'sine', 0.18, 0.2), 100);
    }

    // Warning / Error buzz
    error() {
        this.playTone(220, 'sawtooth', 0.2, 0.2);
    }

    // Button click tap
    click() {
        this.playTone(600, 'sine', 0.03, 0.08);
    }
}

export const sound = new SoundEffects();
