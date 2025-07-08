// components/HangmanDrawing.tsx
type HangmanDrawingProps = {
  incorrectGuesses: number;
};

export default function HangmanDrawing({ incorrectGuesses }: HangmanDrawingProps) {
  return (
    <svg height="200" width="200" className="mx-auto">
      {/* 1. Base */}
      {incorrectGuesses > 0 && <line x1="10" y1="190" x2="190" y2="190" stroke="black" strokeWidth="4" />}
      {/* 2. Pole */}
      {incorrectGuesses > 1 && <line x1="50" y1="190" x2="50" y2="20" stroke="black" strokeWidth="4" />}
      {/* 3. Beam */}
      {incorrectGuesses > 2 && <line x1="50" y1="20" x2="130" y2="20" stroke="black" strokeWidth="4" />}
      {/* 4. Rope */}
      {incorrectGuesses > 3 && <line x1="130" y1="20" x2="130" y2="40" stroke="black" strokeWidth="4" />}
      {/* 5. Head */}
      {incorrectGuesses > 4 && <circle cx="130" cy="55" r="15" stroke="black" strokeWidth="3" fill="none" />}
      {/* 6. Body */}
      {incorrectGuesses > 5 && <line x1="130" y1="70" x2="130" y2="120" stroke="black" strokeWidth="4" />}
      {/* 7. Limbs */}
      {incorrectGuesses > 6 && (
        <>
          {/* Left Arm */}
          <line x1="130" y1="90" x2="110" y2="110" stroke="black" strokeWidth="4" />
          {/* Right Arm */}
          <line x1="130" y1="90" x2="150" y2="110" stroke="black" strokeWidth="4" />
          {/* Left Leg */}
          <line x1="130" y1="120" x2="110" y2="150" stroke="black" strokeWidth="4" />
          {/* Right Leg */}
          <line x1="130" y1="120" x2="150" y2="150" stroke="black" strokeWidth="4" />
        </>
      )}
    </svg>
  );
}
