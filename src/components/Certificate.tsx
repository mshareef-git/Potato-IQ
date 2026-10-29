import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../store/gameStore';
import { DogeshAvatar } from './DogeshAvatar';
import { NeoButton } from './NeoButton';
import { FINALE_DIALOGUE } from '../data/certificateTitles';
import { Award, Printer, RotateCcw } from 'lucide-react';

export const Certificate: React.FC = () => {
  const profile = useGameStore((state) => state.profile);
  const finalTitle = useGameStore((state) => state.finalTitle) || "Certified Wi-Fi Potato";
  const finalExtraRoast = useGameStore((state) => state.finalExtraRoast);
  const finalStamp = useGameStore((state) => state.finalStamp);
  const isAllSkipped = useGameStore((state) => state.isAllSkipped);
  const resetGame = useGameStore((state) => state.resetGame);

  // Trigger confetti burst on certificate mount
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-[760px] mx-auto space-y-6">
      {/* Printable Certificate Frame */}
      <div
        id="royal-certificate"
        className="relative p-6 md:p-10 bg-[#FFFDF7] text-neutral-900 border-8 border-black rounded-xl shadow-[10px_10px_0px_#000] overflow-hidden"
      >
        {/* Certificate Watermark / Background Crest */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
          <span className="text-[180px] font-black">🥔</span>
        </div>

        {/* Decorative corner borders */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-black" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-black" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-black" />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-black" />

        {/* Header */}
        <div className="text-center space-y-1 mb-6 border-b-4 border-black pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-[var(--yellow)] text-black font-heading text-xs uppercase border-2 border-black rounded shadow-[2px_2px_0px_#000] mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>MADHACKD INSTITUTE OF BRAINOLOGY</span>
          </div>

          <h1 className="font-heading text-2xl md:text-4xl text-black tracking-tight uppercase">
            KING DOGESH'S ROYAL IQ CERTIFICATE
          </h1>
          <p className="text-xs font-semibold text-neutral-600 uppercase tracking-widest">
            Officially Unofficial · Legally Non-Binding · Questionably Accredited
          </p>
        </div>

        {/* Body Award */}
        <div className="text-center space-y-4 my-6">
          <div className="text-xs md:text-sm font-heading text-neutral-500 uppercase tracking-widest">
            THIS HEREBY ATTESTS THAT
          </div>

          <div className="inline-block px-6 py-2 bg-neutral-100 border-3 border-black rounded-lg shadow-[3px_3px_0px_#000]">
            <span className="text-2xl md:text-3xl font-heading text-[var(--purple)] uppercase">
              {profile?.assignedNickname || 'SMOOTH BRAIN'}
            </span>
          </div>

          <div className="text-xs md:text-sm font-heading text-neutral-500 uppercase tracking-widest">
            HAS COMPLETED THE POTATO IQ TEST AND ACHIEVED THE VERDICT:
          </div>

          {/* Ridiculous Title */}
          <div className="p-4 bg-[var(--yellow)] border-4 border-black rounded-xl shadow-[5px_5px_0px_#000] my-2">
            <h2 className="font-heading text-xl md:text-3xl text-black uppercase leading-tight">
              👑 {finalTitle} 👑
            </h2>
          </div>

          {finalExtraRoast && (
            <div className="p-2 bg-pink-100 border-2 border-black rounded text-xs md:text-sm font-bold text-pink-900 max-w-md mx-auto">
              "{finalExtraRoast}"
            </div>
          )}

          {/* All-Skipped Gag Stamp */}
          {finalStamp && (
            <div className="inline-block px-4 py-2 border-4 border-red-600 text-red-600 font-heading text-sm md:text-base uppercase rounded transform -rotate-6 shadow-[3px_3px_0px_#EF4444]">
              ★ {finalStamp} ★
            </div>
          )}
        </div>

        {/* Dogesh Finale Plot Twist Section */}
        <div className="mt-8 p-5 bg-[#FDF2F8] border-3 border-[#F43F97] rounded-xl shadow-[4px_4px_0px_#F43F97] flex flex-col md:flex-row items-center gap-4">
          <div className="flex-shrink-0">
            {/* Rolling on back laughing! */}
            <DogeshAvatar state="rolling" size={105} />
          </div>

          <div className="space-y-1 text-neutral-900 text-xs md:text-sm">
            <div className="font-heading text-[var(--pink)] text-xs uppercase tracking-wider">
              INSTRUCTOR DOGESH CONFESSION REVEAL:
            </div>
            {FINALE_DIALOGUE.map((line, idx) => (
              <p key={idx} className="font-bold leading-tight">
                "{line}"
              </p>
            ))}
          </div>
        </div>

        {/* Signatures & Small Disclaimer */}
        <div className="mt-8 pt-4 border-t-2 border-neutral-300 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-600 gap-2">
          <div className="text-center sm:text-left">
            <span className="font-heading text-black text-sm block">🐾 King Dogesh</span>
            <span>PhD in Barkology · Certified Treat Addict</span>
          </div>

          <div className="text-[10px] text-neutral-500 text-center sm:text-right max-w-xs italic">
            Disclaimer: This certificate is a joke. It is not a real IQ test, assessment, or psychological qualification.
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <NeoButton variant="yellow" size="lg" onClick={handlePrint}>
          <Printer className="w-5 h-5 mr-2 inline" />
          <span>DOWNLOAD / PRINT CERTIFICATE</span>
        </NeoButton>

        <NeoButton variant="white" size="lg" onClick={resetGame}>
          <RotateCcw className="w-5 h-5 mr-2 inline" />
          <span>PLAY AGAIN</span>
        </NeoButton>
      </div>
    </div>
  );
};
