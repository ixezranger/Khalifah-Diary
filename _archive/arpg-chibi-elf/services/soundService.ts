
class SoundService {
  private ctx: AudioContext | null = null;
  private bgmNodes: AudioNode[] = [];
  private isMuted: boolean = true;
  private masterGain: GainNode | null = null;
  private nextNoteTime: number = 0;
  private schedulerTimer: number | null = null;
  private beatCount: number = 0;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = this.isMuted ? 0 : 0.4;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(e => console.error("Audio resume failed", e));
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    this.init();
    
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.4, this.ctx.currentTime, 0.1);
    }
    
    if (!muted) {
        this.startBGM();
    } else {
        this.stopBGM();
    }
  }

  public startBGM() {
    this.init();
    if (this.bgmNodes.length > 0 || !this.ctx) return; 

    // 1. Dark Atmosphere Pad (Drone)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const padGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.value = 55; // Low A
    osc2.type = 'triangle';
    osc2.frequency.value = 110.5; // A2 + detune

    filter.type = 'lowpass';
    filter.frequency.value = 300;
    filter.Q.value = 1;

    // Slow filter movement
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 150;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(padGain);
    padGain.connect(this.masterGain!);

    padGain.gain.value = 0.15;
    
    osc1.start();
    osc2.start();
    lfo.start();

    this.bgmNodes.push(osc1, osc2, lfo, padGain, filter, lfoGain);

    // 2. Rhythmic Bass Sequencer
    this.nextNoteTime = this.ctx.currentTime;
    this.beatCount = 0;
    this.scheduleSequence();
  }

  private scheduleSequence() {
      if (!this.ctx || this.isMuted) return;

      const secondsPerBeat = 0.6; 
      const lookahead = 0.1; 

      while (this.nextNoteTime < this.ctx.currentTime + lookahead) {
          this.playBassNote(this.nextNoteTime, this.beatCount);
          this.nextNoteTime += secondsPerBeat;
          this.beatCount++;
      }
      
      this.schedulerTimer = window.setTimeout(() => this.scheduleSequence(), 25);
  }

  private playBassNote(time: number, beat: number) {
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Dark cinematic progression: A -> F -> D -> E
      const sequence = [55, 55, 55, 55, 43.65, 43.65, 36.71, 41.20]; // Hz
      const freq = sequence[Math.floor(beat / 4) % sequence.length];

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, time);
      filter.frequency.exponentialRampToValueAtTime(800, time + 0.1);
      filter.frequency.exponentialRampToValueAtTime(200, time + 0.3);

      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + 0.5);
  }

  public stopBGM() {
    if (this.schedulerTimer) {
        clearTimeout(this.schedulerTimer);
        this.schedulerTimer = null;
    }
    
    this.bgmNodes.forEach(node => {
        try {
            if (node instanceof OscillatorNode) node.stop();
            node.disconnect();
        } catch (e) {}
    });
    this.bgmNodes = [];
  }

  public playSFX(type: 'attack' | 'hit' | 'kill' | 'buy' | 'equip' | 'levelUp' | 'click' | 'skill') {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.connect(this.masterGain);

    switch (type) {
        case 'attack': {
            // Sharp Blade Swish
            const osc = this.ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, t);
            osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);
            
            const noise = this.ctx.createBufferSource();
            noise.buffer = this.createNoiseBuffer();
            const noiseFilter = this.ctx.createBiquadFilter();
            noiseFilter.type = 'highpass';
            noiseFilter.frequency.value = 1000;

            osc.connect(gain);
            noise.connect(noiseFilter);
            noiseFilter.connect(gain);

            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

            osc.start(t);
            osc.stop(t + 0.15);
            noise.start(t);
            noise.stop(t + 0.15);
            break;
        }
        case 'hit': {
            // Punchy Impact
            const osc = this.ctx.createOscillator();
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, t);
            osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
            
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(3000, t);
            filter.frequency.exponentialRampToValueAtTime(100, t + 0.1);

            osc.connect(filter);
            filter.connect(gain);
            
            gain.gain.setValueAtTime(0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
            
            osc.start(t);
            osc.stop(t + 0.1);
            break;
        }
        case 'kill': {
            // Dark Crunch
            const osc1 = this.ctx.createOscillator();
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(100, t);
            osc1.frequency.exponentialRampToValueAtTime(10, t + 0.4);

            const osc2 = this.ctx.createOscillator();
            osc2.type = 'square';
            osc2.frequency.setValueAtTime(80, t);
            osc2.frequency.exponentialRampToValueAtTime(5, t + 0.4);
            
            osc1.connect(gain);
            osc2.connect(gain);
            
            gain.gain.setValueAtTime(0.5, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
            
            osc1.start(t); osc1.stop(t+0.4);
            osc2.start(t); osc2.stop(t+0.4);
            break;
        }
        case 'buy': {
            // Coin
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, t);
            osc.frequency.setValueAtTime(1600, t + 0.05);
            
            gain.gain.setValueAtTime(0.1, t);
            gain.gain.linearRampToValueAtTime(0.3, t + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
            
            osc.connect(gain);
            osc.start(t);
            osc.stop(t + 0.4);
            break;
        }
        case 'levelUp': {
            // Power Chord
            const play = (f: number, d: number) => {
                const o = this.ctx!.createOscillator();
                o.type = 'sawtooth';
                o.frequency.value = f;
                const g = this.ctx!.createGain();
                g.gain.setValueAtTime(0.1, t + d);
                g.gain.exponentialRampToValueAtTime(0.01, t + d + 0.5);
                o.connect(g);
                g.connect(this.masterGain!);
                o.start(t + d);
                o.stop(t + d + 0.5);
            };
            play(440, 0);
            play(554, 0.1);
            play(659, 0.2);
            play(880, 0.4);
            break;
        }
        case 'skill': {
            // Magic Cast
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, t);
            osc.frequency.linearRampToValueAtTime(1200, t + 0.5);
            
            const lfo = this.ctx.createOscillator();
            lfo.frequency.value = 50;
            const lfoGain = this.ctx.createGain();
            lfoGain.gain.value = 500;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            
            osc.connect(gain);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
            
            osc.start(t); lfo.start(t);
            osc.stop(t + 0.5); lfo.stop(t + 0.5);
            break;
        }
        case 'click': {
             // High Tech Blip
             const osc = this.ctx.createOscillator();
             osc.frequency.setValueAtTime(2000, t);
             osc.frequency.exponentialRampToValueAtTime(1000, t + 0.05);
             osc.connect(gain);
             gain.gain.setValueAtTime(0.1, t);
             gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
             osc.start(t);
             osc.stop(t + 0.05);
             break;
        }
    }
  }

  private createNoiseBuffer() {
      if (!this.ctx) return new AudioBuffer({ length: 1, sampleRate: 44100 });
      const bufferSize = this.ctx.sampleRate * 0.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
      }
      return buffer;
  }
}

export const soundService = new SoundService();
