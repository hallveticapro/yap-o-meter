type WindowWithWebkitAudioContext = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

let alertAudioContext: AudioContext | null = null;

function getAlertAudioContext() {
  if (alertAudioContext && alertAudioContext.state !== "closed") {
    return alertAudioContext;
  }

  const AudioContextConstructor =
    window.AudioContext ||
    (window as WindowWithWebkitAudioContext).webkitAudioContext;

  if (!AudioContextConstructor) {
    throw new Error("Web Audio API is not supported");
  }

  alertAudioContext = new AudioContextConstructor();
  return alertAudioContext;
}

export function primeAlertAudio(): boolean {
  try {
    const audioContext = getAlertAudioContext();
    if (audioContext.state === "suspended") {
      void audioContext.resume();
    }
    return true;
  } catch (error) {
    console.warn("Failed to prime alert audio:", error);
    return false;
  }
}

export async function closeAlertAudio(): Promise<void> {
  if (!alertAudioContext) return;

  const audioContext = alertAudioContext;
  alertAudioContext = null;

  if (audioContext.state !== "closed") {
    await audioContext.close();
  }
}

export function playAlert(alertType: string, volume: number = 50): void {
  try {
    const audioContext = getAlertAudioContext();
    const scheduleAlert = () => {
      switch (alertType) {
        case "shush":
          createShushSound(audioContext, volume);
          break;
        case "ding":
          createDingSound(audioContext, volume);
          break;
        case "chime":
          createChimeSound(audioContext, volume);
          break;
        case "bell":
          createBellSound(audioContext, volume);
          break;
        default:
          createBeepSound(audioContext, volume);
          break;
      }
    };

    if (audioContext.state === "suspended") {
      void audioContext.resume().then(scheduleAlert).catch((error: unknown) => {
        console.warn("Failed to resume alert audio:", error);
      });
      return;
    }

    scheduleAlert();
  } catch (error) {
    console.warn("Failed to play alert sound:", error);
  }
}

function createBeepSound(
  audioContext: AudioContext,
  volume: number = 50,
): void {
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800; // Hz
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      (volume / 100) * 1.2,
      audioContext.currentTime + 0.1
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.warn("Failed to create beep sound:", error);
  }
}

function createShushSound(
  audioContext: AudioContext,
  volume: number = 50,
): void {
  try {
    const bufferSize = audioContext.sampleRate * 0.8; // 0.8 seconds
    const buffer = audioContext.createBuffer(
      1,
      bufferSize,
      audioContext.sampleRate
    );
    const channelData = buffer.getChannelData(0);

    // Generate white noise for "shush" sound
    for (let i = 0; i < bufferSize; i++) {
      channelData[i] = (Math.random() * 2 - 1) * 0.1;
    }

    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    source.buffer = buffer;
    filter.type = "highpass";
    filter.frequency.value = 2000; // High frequency for "shush"

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      (volume / 100) * 0.8,
      audioContext.currentTime + 0.1
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.7
    );

    source.start(audioContext.currentTime);
    source.stop(audioContext.currentTime + 0.8);
  } catch (error) {
    console.warn("Failed to create shush sound:", error);
  }
}

function createDingSound(
  audioContext: AudioContext,
  volume: number = 50,
): void {
  try {
    // Create three ding sounds
    for (let i = 0; i < 3; i++) {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 1000; // Hz
      oscillator.type = "sine";

      const startTime = audioContext.currentTime + i * 0.3;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(
        (volume / 100) * 1.2,
        startTime + 0.05
      );
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.2);
    }
  } catch (error) {
    console.warn("Failed to create ding sound:", error);
  }
}

function createChimeSound(
  audioContext: AudioContext,
  volume: number = 50,
): void {
  try {
    const frequencies = [523, 659, 784]; // C, E, G chord

    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = freq;
      oscillator.type = "sine";

      const startTime = audioContext.currentTime + index * 0.1;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(
        (volume / 100) * 0.8,
        startTime + 0.1
      );
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 1.0);

      oscillator.start(startTime);
      oscillator.stop(startTime + 1.0);
    });
  } catch (error) {
    console.warn("Failed to create chime sound:", error);
  }
}

function createBellSound(
  audioContext: AudioContext,
  volume: number = 50,
): void {
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 1200; // Hz
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      (volume / 100) * 1.16,
      audioContext.currentTime + 0.1
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 2.0
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 2.0);
  } catch (error) {
    console.warn("Failed to create bell sound:", error);
  }
}
