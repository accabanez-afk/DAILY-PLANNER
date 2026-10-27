// Web Audio API based alarm and chime generator
let audioCtx: AudioContext | null = null;
let currentAlarmInterval: number | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a pleasant notification chime (single sequence)
 */
export function playChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.45);
    });
  } catch (err) {
    console.warn('Audio chime could not play:', err);
  }
}

/**
 * Play repeating alarm sound until stopped
 */
export function startAlarmLoop(onTick?: () => void): () => void {
  playChime();
  if (onTick) onTick();

  // Clear any existing loop
  if (currentAlarmInterval) {
    window.clearInterval(currentAlarmInterval);
  }

  currentAlarmInterval = window.setInterval(() => {
    playChime();
    if (onTick) onTick();
  }, 2200);

  return stopAlarmLoop;
}

export function stopAlarmLoop() {
  if (currentAlarmInterval) {
    window.clearInterval(currentAlarmInterval);
    currentAlarmInterval = null;
  }
}

/**
 * Request browser desktop notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

/**
 * Send a browser desktop notification
 */
export function triggerDesktopNotification(title: string, options?: NotificationOptions) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        ...options,
      });
    } catch (e) {
      console.warn('Desktop notification failed:', e);
    }
  }
}
