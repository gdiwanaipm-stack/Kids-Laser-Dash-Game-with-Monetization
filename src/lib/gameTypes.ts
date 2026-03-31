export type Character = 'fish' | 'wolf' | 'lion';
export type Background = 'desert' | 'jungle' | 'sky' | 'park' | 'underwater';
export type Screen = 'title' | 'select' | 'playing' | 'store' | 'levelComplete' | 'gameComplete' | 'paused';

export const CHARACTER_EMOJI: Record<Character, string> = { fish: '🐟', wolf: '🐺', lion: '🦁' };
export const CHARACTER_NAMES: Record<Character, string> = { fish: 'Flash Fish', wolf: 'Speedy Wolf', lion: 'Mighty Lion' };
export const BACKGROUNDS: Background[] = ['desert', 'jungle', 'sky', 'park', 'underwater'];

export interface LevelConfig {
  trackLength: number;
  numObstacles: number;
  gapWidth: number;
  numGems: number;
  maxSpeed: number;
  oscillatingCount: number;
}

export const LEVEL_CONFIGS: LevelConfig[] = [
  { trackLength: 3000, numObstacles: 8, gapWidth: 160, numGems: 5, maxSpeed: 5, oscillatingCount: 0 },
  { trackLength: 4000, numObstacles: 12, gapWidth: 140, numGems: 7, maxSpeed: 5.5, oscillatingCount: 2 },
  { trackLength: 5000, numObstacles: 18, gapWidth: 120, numGems: 8, maxSpeed: 6, oscillatingCount: 5 },
  { trackLength: 6500, numObstacles: 25, gapWidth: 100, numGems: 9, maxSpeed: 6.5, oscillatingCount: 8 },
  { trackLength: 8000, numObstacles: 35, gapWidth: 85, numGems: 12, maxSpeed: 7, oscillatingCount: 15 },
];

export const BG_COLORS: Record<Background, { top: string; bottom: string; road: string; roadLine: string }> = {
  desert: { top: '#c2956b', bottom: '#e8c99b', road: '#8b7355', roadLine: '#d4a76a' },
  jungle: { top: '#1a4d2e', bottom: '#2d8a4e', road: '#3d2b1f', roadLine: '#5a8a3c' },
  sky: { top: '#1a6bc4', bottom: '#87ceeb', road: '#d4d4d4', roadLine: '#ffffff' },
  park: { top: '#4a8c3f', bottom: '#7bc46c', road: '#8b8680', roadLine: '#f5f5dc' },
  underwater: { top: '#0a2a4a', bottom: '#1565a0', road: '#0d3d6b', roadLine: '#4fc3f7' },
};

export interface GameSave {
  character: Character;
  level: number;
  gems: number;
  backgrounds: Background[];
}

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
