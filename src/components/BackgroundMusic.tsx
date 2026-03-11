import React, { useRef, useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const BackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(30);
  const [showVolume, setShowVolume] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
      <audio ref={audioRef} src="/ambient-bg.mp3" loop preload="none" />
      
      {showVolume && (
        <div className="industrial-card px-4 py-2 flex items-center gap-3 animate-fade-in w-32">
          <Slider
            value={[volume]}
            onValueChange={(v) => setVolume(v[0])}
            max={100}
            step={1}
            className="w-full"
          />
        </div>
      )}

      <Button
        size="icon"
        variant="outline"
        className="rounded-full w-12 h-12 border-primary/30 bg-background/80 backdrop-blur-sm shadow-lg hover:border-primary/60"
        onClick={togglePlay}
        onMouseEnter={() => setShowVolume(true)}
        onMouseLeave={() => setShowVolume(false)}
      >
        {isPlaying ? (
          <Volume2 className="w-5 h-5 text-primary" />
        ) : (
          <VolumeX className="w-5 h-5 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
};

export default BackgroundMusic;
