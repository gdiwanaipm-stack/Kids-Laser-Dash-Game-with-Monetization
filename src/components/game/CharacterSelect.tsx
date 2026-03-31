import { Character, CHARACTER_EMOJI, CHARACTER_NAMES } from '@/lib/gameTypes';
import { playSelect, characterSounds } from '@/lib/gameAudio';

interface Props {
  onSelect: (c: Character) => void;
}

const characters: Character[] = ['fish', 'wolf', 'lion'];
const descriptions: Record<Character, string> = {
  fish: 'Swift and slippery! Glides through any track.',
  wolf: 'Fast and fierce! Howls past every obstacle.',
  lion: 'Strong and brave! Roars through the course.',
};

export default function CharacterSelect({ onSelect }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-6 bg-background">
      <h1 className="game-title">Choose Your Racer!</h1>
      <p className="text-muted-foreground text-lg">Pick a character and hit the track!</p>
      <div className="flex flex-wrap justify-center gap-6 mt-4">
        {characters.map((c) => (
          <button
            key={c}
            onClick={() => { playSelect(); characterSounds[c](); onSelect(c); }}
            className="game-card flex flex-col items-center gap-4 w-56 cursor-pointer hover:border-primary group"
          >
            <span className="text-7xl float-animation" style={{ animationDelay: `${characters.indexOf(c) * 0.3}s` }}>
              {CHARACTER_EMOJI[c]}
            </span>
            <h2 className="text-xl font-bold text-foreground">{CHARACTER_NAMES[c]}</h2>
            <p className="text-sm text-muted-foreground text-center">{descriptions[c]}</p>
            <span className="game-btn text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Select
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
