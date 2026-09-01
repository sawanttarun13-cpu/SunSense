import { useEffect } from "react";
import { toast } from "sonner";
import { useSocketEvent } from "../hooks/useSocketEvent";

const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    // A pleasant "ding" sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    oscillator.frequency.exponentialRampToValueAtTime(880.00, audioCtx.currentTime + 0.1); // A5

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.4);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

export function GlobalAlertListener() {
  useSocketEvent("alert:new", (alert: any) => {
    // Play sound
    playNotificationSound();

    // Generate toast notification
    toast(alert.type.replace(/_/g, " "), {
      description: alert.message,
      duration: 5000,
      icon: "⚠️"
    });
  });
  
  return null;
}
