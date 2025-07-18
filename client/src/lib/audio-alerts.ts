export function playAlert(alertType: string, volume: number = 50): void {
  const audio = new Audio();
  
  switch (alertType) {
    case 'shush':
      audio.src = '/sounds/shush.mp3';
      break;
    case 'ding':
      audio.src = '/sounds/ding.mp3';
      break;
    case 'chime':
      audio.src = '/sounds/chime.mp3';
      break;
    case 'bell':
      audio.src = '/sounds/bell.mp3';
      break;
    default:
      // Create a simple beep sound using Web Audio API
      createBeepSound(volume);
      return;
  }
  
  audio.volume = volume / 100;
  audio.play().catch(error => {
    console.warn('Failed to play alert sound:', error);
    // Fallback to beep sound
    createBeepSound(volume);
  });
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
