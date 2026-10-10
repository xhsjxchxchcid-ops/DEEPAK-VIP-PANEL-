/**
 * Synthesizes futuristic audio effects using Web Audio API.
 * Zero external assets, 100% reliable, zero latency.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private scanOsc: OscillatorNode | null = null;
  private scanGain: GainNode | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Sound played during EXECUTE loading (Server Scanning / Decrypting)
   */
  public playScanningBeep(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800 + Math.random() * 400, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignore
    }
  }

  /**
   * Spoken AI Voice announcement on Full-Screen Boot Loading (Audio 1):
   * "Mere bhai hack ko server se connect kiya ja raha hai, connect hone ke baad maze se profit karna."
   */
  public speakHackConnecting(onComplete?: () => void): void {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onComplete) onComplete();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find((v) => v.lang.startsWith('hi') || v.lang.includes('IN') || v.name.toLowerCase().includes('hindi'));

      const text = hindiVoice
        ? "मेरे भाई हैक को सर्वर से कनेक्ट किया जा रहा है... कनेक्ट होने के बाद मजे से प्रॉफिट करना!"
        : "Mere bhai hack ko server se connect kiya ja raha hai, connect hone ke baad maze se profit karna.";

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      if (hindiVoice) {
        utterance.voice = hindiVoice;
        utterance.lang = 'hi-IN';
      } else {
        const naturalVoice = voices.find((v) => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'));
        if (naturalVoice) utterance.voice = naturalVoice;
      }

      if (onComplete) {
        utterance.onend = () => onComplete();
        utterance.onerror = () => onComplete();
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onComplete) onComplete();
    }
  }

  /**
   * Spoken AI Voice announcement on Full-Screen Boot Success (Audio 2):
   * "Hack taiyaar ho chuka hai, ab ek nayi UID create kar lo, tabhi hack aapko number prediction ke sath profit karke dega."
   */
  public speakHackConnected(onComplete?: () => void): void {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onComplete) onComplete();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find((v) => v.lang.startsWith('hi') || v.lang.includes('IN') || v.name.toLowerCase().includes('hindi'));

      const text = hindiVoice
        ? "हैक तैयार हो चुका है... अब एक नई यू आई डी क्रिएट कर लो, तभी हैक आपको नंबर प्रेडिक्शन के साथ प्रॉफिट करके देगा!"
        : "Hack taiyaar ho chuka hai, ab ek nayi UID create kar lo, tabhi hack aapko number prediction ke sath profit karke dega.";

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.96;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      if (hindiVoice) {
        utterance.voice = hindiVoice;
        utterance.lang = 'hi-IN';
      } else {
        const naturalVoice = voices.find((v) => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'));
        if (naturalVoice) utterance.voice = naturalVoice;
      }

      if (onComplete) {
        utterance.onend = () => onComplete();
        utterance.onerror = () => onComplete();
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onComplete) onComplete();
    }
  }

  /**
   * Spoken AI Voice warning when someone taps Login button (from video):
   * "Bhai ye private hack hai, to aap old UID ko login nahi kar sakte ho, to ek new number se ek new fresh account create kar lo."
   */
  public speakLoginWarning(onComplete?: () => void): void {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onComplete) onComplete();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(
        (v) =>
          v.lang.startsWith('hi') ||
          v.lang.toLowerCase().includes('in') ||
          v.name.toLowerCase().includes('hindi')
      );

      // Hindi Devnagari if Hindi voice available, otherwise phonetic Hindi Romanized
      const text = hindiVoice
        ? "भाई ये प्राइवेट हैक है, तो आप ओल्ड यू आई डी को लॉगिन नहीं कर सकते हो... तो एक न्यू नंबर से एक न्यू फ्रेश अकाउंट क्रिएट कर लो!"
        : "Bhai ye private hack hai, to aap old UID login nahi kar sakte ho. Ek new number se new fresh account create kar lo!";

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;

      if (hindiVoice) {
        utterance.voice = hindiVoice;
        utterance.lang = 'hi-IN';
      } else {
        const naturalVoice = voices.find(
          (v) =>
            v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Samantha') ||
            v.lang.startsWith('en')
        );
        if (naturalVoice) utterance.voice = naturalVoice;
      }

      if (onComplete) {
        utterance.onend = () => onComplete();
        utterance.onerror = () => onComplete();
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onComplete) onComplete();
    }
  }

  /**
   * Spoken AI Voice when user is on login/register screen and signal shows REGISTER:
   * "Bhai pehle register karo, register hone ke baad hi signal chalu hoga!"
   */
  public speakRegisterRequiredVoice(onComplete?: () => void): void {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onComplete) onComplete();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(
        (v) =>
          v.lang.startsWith('hi') ||
          v.lang.toLowerCase().includes('in') ||
          v.name.toLowerCase().includes('hindi')
      );

      const text = hindiVoice
        ? "भाई पहले रजिस्टर करो, रजिस्टर होने के बाद ही सिग्नल चालू होगा!"
        : "Bhai pehle register karo, register hone ke baad hi signal chalu hoga!";

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;

      if (hindiVoice) {
        utterance.voice = hindiVoice;
        utterance.lang = 'hi-IN';
      } else {
        const naturalVoice = voices.find(
          (v) =>
            v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Samantha') ||
            v.lang.startsWith('en')
        );
        if (naturalVoice) utterance.voice = naturalVoice;
      }

      if (onComplete) {
        utterance.onend = () => onComplete();
        utterance.onerror = () => onComplete();
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onComplete) onComplete();
    }
  }

  /**
   * Spoken AI Voice when user successfully enters the game after registering:
   * "Registration verified! Game ke andar VIP signals chalu kar diye gaye hain!"
   */
  public speakAccessGrantedVoice(onComplete?: () => void): void {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onComplete) onComplete();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(
        (v) =>
          v.lang.startsWith('hi') ||
          v.lang.toLowerCase().includes('in') ||
          v.name.toLowerCase().includes('hindi')
      );

      const text = hindiVoice
        ? "रजिस्ट्रेशन वेरीफाइड! वी आई पी सिग्नल्स चालू कर दिए गए हैं!"
        : "Registration verified! VIP signals chalu kar diye gaye hain!";

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;

      if (hindiVoice) {
        utterance.voice = hindiVoice;
        utterance.lang = 'hi-IN';
      } else {
        const naturalVoice = voices.find(
          (v) =>
            v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Samantha') ||
            v.lang.startsWith('en')
        );
        if (naturalVoice) utterance.voice = naturalVoice;
      }

      if (onComplete) {
        utterance.onend = () => onComplete();
        utterance.onerror = () => onComplete();
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onComplete) onComplete();
    }
  }

  /**
   * Dual-tone access denied warning alarm buzzer
   */
  public playWarningAlarm(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Tone 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(360, now);
      osc1.frequency.setValueAtTime(280, now + 0.12);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.28);

      // Tone 2 (second burst)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(360, now + 0.3);
      osc2.frequency.setValueAtTime(280, now + 0.42);
      gain2.gain.setValueAtTime(0.25, now + 0.3);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.58);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.3);
      osc2.stop(now + 0.58);
    } catch {
      // Ignore
    }
  }

  /**
   * Spoken AI Voice announcement on EXECUTE login:
   * "Mere bhai, panel ko server se connect kiya ja raha hai, kripya intezar karein..."
   */
  public speakConnectingServer(onComplete?: () => void): void {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onComplete) onComplete();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const text = "Mere bhai, panel ko server se connect kiya ja raha hai, kripya intezar karein...";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.02;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(v => v.lang.startsWith('hi') || v.lang.includes('IN'));
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      } else {
        const naturalVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'));
        if (naturalVoice) utterance.voice = naturalVoice;
      }

      if (onComplete) {
        utterance.onend = () => onComplete();
        utterance.onerror = () => onComplete();
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      if (onComplete) onComplete();
    }
  }

  /**
   * Spoken AI Voice announcement: speaks "Deepak VIP Signal: BIG, Number 7" etc.
   */
  public speakSignalVoice(isBig: boolean, number: number | string | null): void {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const signalType = isBig ? 'BIG' : 'SMALL';
      const numText = number !== null && number !== undefined ? `Number ${number}` : '';
      const text = `Deepak VIP Signal: ${signalType}! ${numText}!`;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
      if (voice) {
        utterance.voice = voice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore
    }
  }

  /**
   * Sound played when new draw arrives
   */
  public playDrawResultChime(isBig: boolean): void {
    this.playSignalRevealChime(isBig);
  }

  /**
   * Epic signal reveal fanfare when signal finishes calculating
   */
  public playSignalRevealChime(isBig: boolean): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // High-tech ascending arpeggio
      const notes = isBig
        ? [523.25, 659.25, 783.99, 1046.50, 1318.51] // C Major 9
        : [440.00, 554.37, 659.25, 880.00, 1108.73];  // A Major 9

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx >= 3 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.22, now + idx * 0.06 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.55);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Laser click when tapping EXECUTE
   */
  public playExecuteLaser(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Ignore
    }
  }

  /**
   * Smooth whoosh sound when hiding window into logo
   */
  public playHideWoosh(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.2);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Ignore
    }
  }

  /**
   * Pop / deploy sound when expanding from logo
   */
  public playOpenDeploy(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.16);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Ignore
    }
  }

  /**
   * Subtle tick on buttons
   */
  public playClickSound(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Ignore
    }
  }
}

export const soundEffects = new SoundEngine();
