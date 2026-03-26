
const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private init() {
    if (!this.ctx && AudioContextClass) {
      try {
        this.ctx = new AudioContextClass();
      } catch (e) {
        console.warn("Web Audio API not supported or blocked");
      }
    }
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Crisp, high-pitch click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);
      
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.05);
    } catch (e) {}
  }

  playTabChange() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Softer, rounder sound for navigation
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.linearRampToValueAtTime(500, t + 0.08);
      
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(t);
      osc.stop(t + 0.08);
    } catch (e) {}
  }

  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    try {
      const t = this.ctx.currentTime;
      
      // Gentle major chord arpeggio
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      
      notes.forEach((freq, i) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          
          const start = t + (i * 0.04);
          
          osc.type = 'sine';
          osc.frequency.value = freq;
          
          gain.gain.setValueAtTime(0.05, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
          
          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          
          osc.start(start);
          osc.stop(start + 0.3);
      });
    } catch (e) {}
  }

  playPop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
      
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    } catch (e) {}
  }
}

export const sounds = new SoundManager();
