import React from 'react';

interface LotteryBall3DProps {
  number: number;
  colors: Array<'green' | 'red' | 'violet'>;
  isNewResultArrival: boolean;
  size?: number;
}

export const LotteryBall3D: React.FC<LotteryBall3DProps> = ({
  number,
  colors,
  isNewResultArrival,
  size = 80,
}) => {
  const isVioletSplit = colors.includes('violet');
  const isGreen = colors.includes('green');
  const isRed = colors.includes('red');

  // Background styling based on WinGo color rules
  let sphereBackground = 'radial-gradient(circle at 35% 30%, #ff5252 0%, #d32f2f 45%, #7f0000 100%)';
  let innerCircleBorder = 'border-red-400';
  let numberColor = 'text-red-950';

  if (isVioletSplit) {
    // Split color ball with violet & red/green accents (matches user screenshot ball 0)
    if (isRed) {
      sphereBackground = 'radial-gradient(circle at 35% 30%, #ffffff 0%, #f43f5e 30%, #9333ea 70%, #4c0519 100%)';
      innerCircleBorder = 'border-purple-300';
      numberColor = 'text-purple-900';
    } else {
      sphereBackground = 'radial-gradient(circle at 35% 30%, #ffffff 0%, #10b981 30%, #9333ea 70%, #064e3b 100%)';
      innerCircleBorder = 'border-purple-300';
      numberColor = 'text-emerald-900';
    }
  } else if (isGreen) {
    sphereBackground = 'radial-gradient(circle at 35% 30%, #6ee7b7 0%, #10b981 40%, #064e3b 100%)';
    innerCircleBorder = 'border-emerald-300';
    numberColor = 'text-emerald-950';
  } else {
    // Pure Red
    sphereBackground = 'radial-gradient(circle at 35% 30%, #fda4af 0%, #f43f5e 40%, #881337 100%)';
    innerCircleBorder = 'border-rose-300';
    numberColor = 'text-rose-950';
  }

  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`relative rounded-full flex items-center justify-center select-none transition-all duration-500 ${
        isNewResultArrival ? 'scale-110 animate-bounce' : 'hover:scale-105'
      }`}
    >
      {/* 3D Ball Sphere Body */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: sphereBackground,
        }}
        className="lottery-sphere w-full h-full rounded-full flex items-center justify-center p-2.5 relative border border-white/40 overflow-hidden"
      >
        {/* Subtle patterned side dots or stripes like billiard / lottery balls */}
        <div className="absolute inset-0 rounded-full opacity-35 pointer-events-none">
          <div className="absolute top-1 left-2 w-3 h-3 rounded-full bg-white blur-[0.5px]" />
          <div className="absolute bottom-1 right-2 w-3 h-3 rounded-full bg-white blur-[0.5px]" />
        </div>

        {/* Center White Disc with Number */}
        <div
          style={{
            width: `${size * 0.58}px`,
            height: `${size * 0.58}px`,
          }}
          className={`rounded-full bg-gradient-to-b from-white via-slate-100 to-slate-200 shadow-[inset_0_2px_4px_rgba(0,0,0,0.35),0_2px_5px_rgba(0,0,0,0.5)] flex items-center justify-center border ${innerCircleBorder} z-10`}
        >
          <span
            style={{ fontSize: `${size * 0.36}px` }}
            className={`font-mono-terminal font-black leading-none drop-shadow-sm ${numberColor}`}
          >
            {number}
          </span>
        </div>

        {/* Bottom 3D shadow reflection */}
        <div className="absolute inset-x-2 bottom-1 h-3 rounded-full bg-black/40 blur-sm pointer-events-none" />
      </div>

      {/* Floating Ground Drop Shadow */}
      <div
        style={{
          width: `${size * 0.75}px`,
          height: `${size * 0.18}px`,
          bottom: `-${size * 0.08}px`,
        }}
        className="absolute rounded-full bg-black/80 blur-[4px] pointer-events-none -z-10"
      />
    </div>
  );
};
