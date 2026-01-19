interface HangmanDrawingProps {
  wrongGuesses: number;
  maxWrongs: number;
}

export function HangmanDrawing({ wrongGuesses, maxWrongs = 6 }: HangmanDrawingProps) {
  const parts = [
    // Head
    <circle key="head" cx="200" cy="100" r="30" stroke="white" strokeWidth="4" fill="none" />,
    // Body
    <line key="body" x1="200" y1="130" x2="200" y2="200" stroke="white" strokeWidth="4" />,
    // Left arm
    <line key="left-arm" x1="200" y1="150" x2="160" y2="180" stroke="white" strokeWidth="4" />,
    // Right arm
    <line key="right-arm" x1="200" y1="150" x2="240" y2="180" stroke="white" strokeWidth="4" />,
    // Left leg
    <line key="left-leg" x1="200" y1="200" x2="170" y2="250" stroke="white" strokeWidth="4" />,
    // Right leg
    <line key="right-leg" x1="200" y1="200" x2="230" y2="250" stroke="white" strokeWidth="4" />
  ];

  return (
    <div className="flex justify-center">
      <svg width="300" height="300" viewBox="0 0 300 300" className="max-w-full">
        {/* Gallows */}
        <line x1="10" y1="280" x2="150" y2="280" stroke="white" strokeWidth="4" />
        <line x1="50" y1="280" x2="50" y2="20" stroke="white" strokeWidth="4" />
        <line x1="50" y1="20" x2="200" y2="20" stroke="white" strokeWidth="4" />
        <line x1="200" y1="20" x2="200" y2="70" stroke="white" strokeWidth="4" />
        
        {/* Body parts based on wrong guesses */}
        {parts.slice(0, wrongGuesses)}
      </svg>
    </div>
  );
}
