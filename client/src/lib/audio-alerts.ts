export function playAlert(alertType: string, volume: number = 50): void {
  // Use Web Audio API for all alerts to ensure they work
  switch (alertType) {
    case 'shush':
      createShushSound(volume);
      break;
    case 'ding':
      createDingSound(volume);
      break;
    case 'chime':
      createChimeSound(volume);
      break;
    case 'bell':
      createBellSound(volume);
      break;
    default:
      createBeepSound(volume);
      break;
  }
}

function createBeepSound(volume: number = 50): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800; // Hz
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume / 100 * 0.3, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.warn('Failed to create beep sound:', error);
  }
}

function createShushSound(volume: number = 50): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const bufferSize = audioContext.sampleRate * 0.8; // 0.8 seconds
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const channelData = buffer.getChannelData(0);
    
    // Generate white noise for "shush" sound
    for (let i = 0; i < bufferSize; i++) {
      channelData[i] = (Math.random() * 2 - 1) * 0.1;
    }
    
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    source.buffer = buffer;
    filter.type = 'highpass';
    filter.frequency.value = 2000; // High frequency for "shush"
    
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume / 100 * 0.2, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.7);
    
    source.start(audioContext.currentTime);
    source.stop(audioContext.currentTime + 0.8);
  } catch (error) {
    console.warn('Failed to create shush sound:', error);
  }
}

function createDingSound(volume: number = 50): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create three ding sounds
    for (let i = 0; i < 3; i++) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1000; // Hz
      oscillator.type = 'sine';
      
      const startTime = audioContext.currentTime + i * 0.3;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume / 100 * 0.3, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.2);
    }
  } catch (error) {
    console.warn('Failed to create ding sound:', error);
  }
}

function createChimeSound(volume: number = 50): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const frequencies = [523, 659, 784]; // C, E, G chord
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      const startTime = audioContext.currentTime + index * 0.1;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume / 100 * 0.2, startTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 1.0);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 1.0);
    });
  } catch (error) {
    console.warn('Failed to create chime sound:', error);
  }
}

function createBellSound(volume: number = 50): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 1200; // Hz
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume / 100 * 0.4, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2.0);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 2.0);
  } catch (error) {
    console.warn('Failed to create bell sound:', error);
  }
}
