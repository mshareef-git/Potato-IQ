import React, { useState, useEffect } from 'react';
import { audioController } from '../utils/audioController';
import { Volume2, VolumeX } from 'lucide-react';

export const AudioHeaderControl: React.FC = () => {
  const [audioState, setAudioState] = useState({
    isPlaying: audioController.isPlaying(),
    isMuted: audioController.getIsMuted(),
    volume: audioController.getVolume(),
  });

  useEffect(() => {
    return audioController.subscribe((st) => setAudioState(st));
  }, []);

  const handleToggleMute = () => {
    // If not started yet, also kick off music
    if (!audioState.isPlaying) {
      audioController.startMusic();
    }
    audioController.toggleMute();
  };

  return (
    <div className="flex items-center gap-1.5 bg-neutral-100 border-2 border-black rounded px-2 py-1 shadow-[2px_2px_0px_#000]">
      <button
        type="button"
        onClick={handleToggleMute}
        className="text-black hover:text-yellow-600 transition-colors cursor-pointer"
        title={audioState.isMuted ? 'Unmute BGM' : 'Mute BGM'}
        aria-label="Toggle audio"
      >
        {audioState.isMuted ? (
          <VolumeX className="w-4 h-4 text-red-500" />
        ) : (
          <Volume2 className="w-4 h-4 text-green-600" />
        )}
      </button>

      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={audioState.isMuted ? 0 : audioState.volume}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          if (audioState.isMuted && val > 0) {
            audioController.toggleMute();
          }
          audioController.setVolume(val);
        }}
        className="w-14 h-1.5 accent-black cursor-pointer"
        title={`BGM Volume: ${Math.round(audioState.volume * 100)}%`}
      />
    </div>
  );
};
