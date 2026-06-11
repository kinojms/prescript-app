/* ============================================================
   AUDIO MODULE
   Manages audio playback for message sounds
   ============================================================ */

import { state } from './state.js';

/**
 * Starts overlapping message2 audio at regular intervals
 */
export function startOverlappingMessage2(dom) {
  if (!dom.message2) return;

  const checkDuration = () => {
    if (dom.message2.duration) {
      const intervalMs = Math.max(100, (dom.message2.duration - 0.1) * 1000);
      state.message2Interval = setInterval(() => {
        const audio = new Audio('./assets/audio/index_message_2.wav');
        audio.volume = 1.0;
        audio.play().catch(() => {});
      }, intervalMs);
      // Play the first one immediately
      const firstAudio = new Audio('./assets/audio/index_message_2.wav');
      firstAudio.volume = 1.0;
      firstAudio.play().catch(() => {});
    } else {
      setTimeout(checkDuration, 10);
    }
  };
  checkDuration();
}

/**
 * Plays message1 audio and schedules message2 to follow
 */
export function playMessageSequence(dom) {
  if (!dom.message1) return;

  dom.message1.volume = 1.0;
  if (dom.message2) dom.message2.volume = 1.0;
  dom.message1.play().catch(() => {});

  const checkDuration = () => {
    if (dom.message1.duration) {
      const delay = Math.max(0, (dom.message1.duration - 0.1) * 1000);
      setTimeout(() => {
        startOverlappingMessage2(dom);
      }, delay);
    } else {
      setTimeout(checkDuration, 10);
    }
  };
  checkDuration();
}
