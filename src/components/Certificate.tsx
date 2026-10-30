import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../store/gameStore';
import { NeoButton } from './NeoButton';
import { DOGESH_ASSETS } from '../data/assetManifest';
import { FINALE_DIALOGUE } from '../data/certificateTitles';
import { Award, Printer, RotateCcw } from 'lucide-react';

export const Certificate: React.FC = () => {
  const profile = useGameStore((state) => state.profile);
  const finalTitle = useGameStore((state) => state.finalTitle) || "Certified Wi-Fi Potato";
  const finalExtraRoast = useGameStore((state) => state.finalExtraRoast);
  const finalStamp = useGameStore((state) => state.finalStamp);
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
    <div className="w-full max-w-6xl mx-auto space-y-6 px-2 sm:px-4">
      {/* Printable Landscape Certificate Frame */}
      <div
        id="royal-certificate"
        className="relative p-6 md:p-10 lg:p-12 bg-[#FFFDF7] text-neutral-900 border-8 border-black rounded-xl shadow-[12px_12px_0px_#000] overflow-hidden w-full"
      >
        {/* Certificate Watermark / Background Crest */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
          <span className="text-[220px] font-black">🥔</span>
        </div>

        {/* Decorative corner borders */}
        <div className="absolute top-2 left-2 w-10 h-10 border-t-4 border-l-4 border-black" />
        <div className="absolute top-2 right-2 w-10 h-10 border-t-4 border-r-4 border-black" />
        <div className="absolute bottom-2 left-2 w-10 h-10 border-b-4 border-l-4 border-black" />
        <div className="absolute bottom-2 right-2 w-10 h-10 border-b-4 border-r-4 border-black" />

        {/* Top section */}
        <div className="text-center space-y-1.5 mb-6 border-b-4 border-black pb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--yellow)] text-black font-heading text-xs uppercase border-2 border-black rounded shadow-[2px_2px_0px_#000] mb-1">
            <Award className="w-4 h-4" />
            <span>MADHACKD INSTITUTE OF BRAINOLOGY</span>
          </div>

          <h1 className="font-heading text-2xl md:text-4xl lg:text-5xl text-black tracking-tight uppercase">
            KING DOGESH'S ROYAL IQ CERTIFICATE
          </h1>
          <p className="text-xs md:text-sm font-bold text-neutral-800 uppercase tracking-widest">
            OFFICIALLY UNOFFICIAL · MADHACKD INSTITUTE
          </p>
        </div>

        {/* Recipient & IQ Verdict */}
        <div className="text-center space-y-4 my-6">
          <div className="text-xs md:text-sm font-heading text-neutral-800 uppercase tracking-widest font-black">
            THIS CERTIFICATE IS AWARDED TO
          </div>

          <div className="inline-block px-8 py-2.5 bg-neutral-100 border-3 border-black rounded-lg shadow-[4px_4px_0px_#000]">
            <span className="text-2xl md:text-4xl font-heading text-purple-700 uppercase tracking-tight">
              {profile?.assignedNickname || 'SMOOTH BRAIN'}
            </span>
          </div>

          {/* Primary Focus: Explicit YOUR IQ IS... Heading */}
          <div className="pt-2">
            <div className="text-xs md:text-sm font-heading text-neutral-900 uppercase tracking-widest font-black mb-1">
              YOUR IQ IS...
            </div>

            <div className="p-4 md:p-6 bg-[var(--yellow)] border-4 border-black rounded-xl shadow-[6px_6px_0px_#000] my-2 max-w-4xl mx-auto">
              <h2 className="font-heading text-xl md:text-3xl lg:text-4xl text-black uppercase leading-tight tracking-tight">
                👑 {finalTitle} 👑
              </h2>
            </div>
          </div>

          {finalExtraRoast && (
            <div className="p-2.5 bg-pink-100 border-2 border-black rounded text-xs md:text-sm font-bold text-pink-950 max-w-xl mx-auto shadow-[2px_2px_0px_#000]">
              "{finalExtraRoast}"
            </div>
          )}

          {/* All-Skipped Gag Stamp */}
          {finalStamp && (
            <div className="inline-block px-5 py-2.5 border-4 border-red-600 text-red-600 font-heading text-sm md:text-base uppercase rounded transform -rotate-3 shadow-[4px_4px_0px_#EF4444] bg-red-50">
              ★ {finalStamp} ★
            </div>
          )}
        </div>

        {/* Dogesh Finale Plot Twist Section (Horizontal Two-Column Layout) */}
        <div className="mt-8 p-5 md:p-6 bg-[#FDF2F8] border-3 border-[#F43F97] rounded-xl shadow-[4px_4px_0px_#F43F97] grid grid-cols-1 md:grid-cols-[130px_1fr] items-center gap-4 md:gap-6 text-left">
          <div className="flex justify-center flex-shrink-0">
            <img
              src={DOGESH_ASSETS.laugh}
              alt="King Dogesh laughing uncontrollably"
              className="w-28 h-28 md:w-32 md:h-32 object-contain filter drop-shadow-[4px_4px_0px_#000]"
              draggable={false}
            />
          </div>

          <div className="space-y-1.5 text-neutral-950">
            <div className="font-heading text-pink-700 text-xs md:text-sm uppercase tracking-wider font-black">
              INSTRUCTOR DOGESH CONFESSION REVEAL:
            </div>
            {FINALE_DIALOGUE.map((line, idx) => (
              <p key={idx} className="font-bold text-xs md:text-sm leading-relaxed text-neutral-900">
                "{line}"
              </p>
            ))}
          </div>
        </div>

        {/* Bottom Section: Signature & Parody Disclaimer */}
        <div className="mt-8 pt-4 border-t-2 border-neutral-300 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-900 gap-3 font-medium">
          <div className="text-center sm:text-left">
            <span className="font-heading text-black text-sm md:text-base block">🐾 KING DOGESH</span>
            <span className="text-neutral-800 font-bold">PhD in Barkology · Certified Treat Addict</span>
          </div>

          <div className="text-[11px] text-neutral-700 text-center sm:text-right max-w-sm italic font-semibold">
            Disclaimer: This certificate is a joke. It is not a real IQ test, assessment, or psychological qualification.
          </div>
        </div>
      </div>

      {/* Action Buttons (Excluded from print) */}
      <div className="no-print flex flex-wrap items-center justify-center gap-4 pt-2">
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

