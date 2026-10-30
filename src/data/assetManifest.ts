// Centralized Asset Manifest for Dogesh, GIFs, and Audio
// Using explicit Vite asset imports to ensure bundle resolution and hashed URLs in production

// Dogesh PNGs
import baseDogesh from '../../assets/dogesh/base dogesh.png';
import dogeshAttack from '../../assets/dogesh/dogesh attack.png';
import dogeshCry from '../../assets/dogesh/dogesh cry.png';
import dogeshGuard from '../../assets/dogesh/dogesh guard.png';
import dogeshLaugh from '../../assets/dogesh/dogesh laugh.png';
import dogeshWalk from '../../assets/dogesh/dogesh walk.png';

// GIFs
import ad1Gif from '../../assets/gif/ad1.gif';
import ad3Gif from '../../assets/gif/ad3.gif';
import bookGif from '../../assets/gif/book.gif';
import brainGif from '../../assets/gif/brain.gif';
import dividerGif from '../../assets/gif/divider.gif';
import galaxyGif from '../../assets/gif/galaxy.gif';
import globeGif from '../../assets/gif/globe.gif';
import makeMoneyNowGif from '../../assets/gif/make money now.gif';
import monkeyNumberGif from '../../assets/gif/monkey number.gif';
import numberGif from '../../assets/gif/number.gif';
import number2Gif from '../../assets/gif/number2.gif';
import skullGif from '../../assets/gif/skull.gif';
import treasureGif from '../../assets/gif/treasure.gif';
import underConstructionGif from '../../assets/gif/under constiuction .gif';
import underConstruction1Gif from '../../assets/gif/under construction1.gif';

// Music
import cameronsWorldCarpentry from '../../assets/background music/camerons_world_[carpentry_mix].mp3';
import rejectedWorld from '../../assets/background music/rejectedworld.mp3';

export const DOGESH_ASSETS = {
  base: baseDogesh,
  attack: dogeshAttack,
  cry: dogeshCry,
  guard: dogeshGuard,
  laugh: dogeshLaugh,
  walk: dogeshWalk,
} as const;

export type DogeshPose = keyof typeof DOGESH_ASSETS;

export interface GifAssetDef {
  id: string;
  name: string;
  src: string;
  category: 'ad' | 'brain' | 'reward' | 'skull' | 'weird' | 'tech';
  alt: string;
  closable?: boolean;
}

export const GIF_ASSETS: GifAssetDef[] = [
  { id: 'ad1', name: 'Hot Single Potatoes in Your Area', src: ad1Gif, category: 'ad', alt: 'Retro Ad 1', closable: true },
  { id: 'ad3', name: 'Download More RAM', src: ad3Gif, category: 'ad', alt: 'Retro Ad 3', closable: true },
  { id: 'make-money', name: 'Make Money Fast $$$', src: makeMoneyNowGif, category: 'ad', alt: 'Make Money Now', closable: true },
  { id: 'brain', name: 'Brain In A Jar', src: brainGif, category: 'brain', alt: 'Rotating Brain', closable: true },
  { id: 'skull', name: 'Spinning Skull', src: skullGif, category: 'skull', alt: 'Spinning Skull', closable: true },
  { id: 'treasure', name: 'Super Chest Reward', src: treasureGif, category: 'reward', alt: 'Treasure Chest', closable: true },
  { id: 'globe', name: 'Rotating Cyber Globe', src: globeGif, category: 'weird', alt: 'Cyber Globe', closable: true },
  { id: 'galaxy', name: 'Spiral Galaxy', src: galaxyGif, category: 'weird', alt: 'Galaxy', closable: true },
  { id: 'book', name: 'Ancient Tome of Knowledge', src: bookGif, category: 'weird', alt: 'Spinning Book', closable: true },
  { id: 'monkey-number', name: 'Monkey Number Generator', src: monkeyNumberGif, category: 'weird', alt: 'Monkey Number', closable: true },
  { id: 'number', name: 'Matrix Number Stream', src: numberGif, category: 'weird', alt: 'Matrix Number', closable: true },
  { id: 'number2', name: 'Cyber Counter', src: number2Gif, category: 'weird', alt: 'Number Counter', closable: true },
  { id: 'under-construction', name: 'Under Construction', src: underConstructionGif, category: 'tech', alt: 'Under Construction', closable: true },
  { id: 'under-construction1', name: 'Web 1.0 Caution', src: underConstruction1Gif, category: 'tech', alt: 'Under Construction Caution', closable: true },
];

export const AUDIO_ASSETS = {
  bgmPrimary: cameronsWorldCarpentry,
  rejected: rejectedWorld,
} as const;
