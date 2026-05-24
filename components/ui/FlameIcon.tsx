import Svg, { Path, Ellipse, Defs, RadialGradient, Stop } from 'react-native-svg';

interface FlameIconProps {
  size?: number;
  opacity?: number;
}

// Static flame SVG — used on all screens except the active session screen.
// The active session screen uses the Rive animation (Sprint 2).
export function FlameIcon({ size = 48, opacity = 1 }: FlameIconProps) {
  return (
    <Svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 40 48"
      style={{ opacity }}
    >
      <Defs>
        <RadialGradient id="fg1" cx="50%" cy="100%" r="80%">
          <Stop offset="0%"   stopColor="#fff4e0" />
          <Stop offset="30%"  stopColor="#f0a050" />
          <Stop offset="70%"  stopColor="#d45a10" />
          <Stop offset="100%" stopColor="#8a2000" stopOpacity={0.4} />
        </RadialGradient>
        <RadialGradient id="fg2" cx="50%" cy="90%" r="60%">
          <Stop offset="0%"   stopColor="#ffe8b0" />
          <Stop offset="60%"  stopColor="#e07020" />
          <Stop offset="100%" stopColor="#b03000" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Path
        d="M20 2 C16 10 10 14 10 22 C10 30 14 36 20 38 C26 36 30 30 30 22 C30 14 24 10 20 2Z"
        fill="url(#fg1)"
      />
      <Path
        d="M20 16 C18 20 14 22 15 28 C16 32 18 34 20 35 C22 34 24 32 25 28 C26 22 22 20 20 16Z"
        fill="url(#fg2)"
      />
      <Ellipse cx={20} cy={38} rx={7} ry={3} fill="#c04010" opacity={0.35} />
    </Svg>
  );
}
