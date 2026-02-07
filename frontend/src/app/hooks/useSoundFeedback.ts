import { useCallback } from 'react';

export function useSoundFeedback() {

  const playBeep = useCallback((type: 'start' | 'stop') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === 'start') {
        oscillator.frequency.value = 880;   // son plus aigu → micro ouvert
        gainNode.gain.value = 0.15;
      } else {
        oscillator.frequency.value = 440;   // son plus grave → micro fermé
        gainNode.gain.value = 0.12;
      }

      oscillator.start();

      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, 160);

    } catch (e) {
      console.log('Audio feedback non supporté', e);
    }
  }, []);

  return { playBeep };
}
