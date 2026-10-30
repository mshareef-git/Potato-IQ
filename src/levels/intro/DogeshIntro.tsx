import React, { useState, useEffect } from 'react';
import { NeoCard } from '../../components/NeoCard';
import { NeoButton } from '../../components/NeoButton';
import { DOGESH_ASSETS } from '../../data/assetManifest';
import { useGameStore } from '../../store/gameStore';
import { audioController } from '../../utils/audioController';
import { Crown, Sparkles } from 'lucide-react';

export interface DogeshIntroProps {
  onDogeshReaction?: (comment: string, state: 'talk' | 'laugh' | 'smug' | 'angry') => void;
}

export const DogeshIntro: React.FC<DogeshIntroProps> = () => {
  const goNext = useGameStore((state) => state.goNext);
  const [stagedStep, setStagedStep] = useState<number>(1);

  useEffect(() => {
    const t1 = setTimeout(() => setStagedStep(2), 700);
    const t2 = setTimeout(() => setStagedStep(3), 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleBegin = () => {
    audioController.startMusic();
    audioController.playSoundEffect('click');
    goNext();
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 py-4 animate-scale-in">
      <NeoCard size="large" className="p-6 md:p-10 text-center relative overflow-hidden">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--yellow)] text-black border-2 border-black rounded-full font-heading text-xs tracking-wider uppercase mb-4 shadow-[2px_2px_0px_#000]">
          <Crown className="w-3.5 h-3.5 text-yellow-800" />
          <span>ROYAL INTELLECTUAL AUDIENCE</span>
        </div>

        {/* Real Dogesh Image */}
        <div className="flex justify-center mb-6">
          <div className="relative group cursor-pointer" title="Instructor Dogesh">
            <div className="w-44 h-44 md:w-52 md:h-52 rounded-2xl bg-gradient-to-b from-yellow-200 to-amber-300 border-4 border-black shadow-[6px_6px_0px_#000] flex items-center justify-center p-2 overflow-hidden">
              <img
                src={DOGESH_ASSETS.base}
                alt="Instructor Dogesh Judging Pose"
                className="w-full h-full object-contain filter drop-shadow-[2px_4px_6px_rgba(0,0,0,0.25)] transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            {/* Crown decal */}
            <div className="absolute -top-3 -right-3 bg-[var(--pink)] text-white p-1.5 border-2 border-black rounded-lg shadow-[2px_2px_0px_#000] rotate-12">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Speech Reveal Box */}
        <div className="space-y-4 max-w-xl mx-auto mb-8 text-neutral-900 bg-white border-3 border-black p-5 rounded-xl shadow-[4px_4px_0px_#000]">
          <p className="font-heading text-sm md:text-base leading-snug tracking-tight text-neutral-900 uppercase">
            "BEHOLD! I AM INSTRUCTOR DOGESH — KING OF INTELLIGENCE, LORD OF LOGIC, AND THE GREATEST MIND TO EVER WALK ON FOUR LEGS."
          </p>

          {stagedStep >= 2 && (
            <p className="text-xs md:text-sm font-bold text-neutral-900 leading-snug animate-fade-in uppercase">
              "I HAVE PERSONALLY DECLARED MYSELF THE WORLD’S MOST QUALIFIED IQ EXAMINER."
            </p>
          )}

          {stagedStep >= 3 && (
            <p className="text-xs md:text-sm font-bold text-pink-600 leading-snug animate-fade-in uppercase">
              "YOU WILL NOW TAKE MY POTATO IQ TEST. TRY NOT TO EMBARRASS YOUR ENTIRE SPECIES."
            </p>
          )}
        </div>

        {/* CTA Button */}
        <div className="max-w-md mx-auto">
          <NeoButton
            variant="yellow"
            size="lg"
            fullWidth
            onClick={handleBegin}
            className="py-4 text-lg md:text-xl font-heading shadow-[6px_6px_0px_#000] hover:scale-102"
          >
            BEGIN THE HUMILIATION 🚀
          </NeoButton>
        </div>

        <p className="text-[11px] text-neutral-800 font-bold mt-4 tracking-wide uppercase">
          * Headphones recommended · Background music will start automatically
        </p>
      </NeoCard>
    </div>
  );
};
