import Svg, { Circle, G, Path, Rect, type SvgProps } from "react-native-svg";

/**
 * Bespoke navigation icons.
 *
 * Each icon draws two ways from one 24x24 grid: a stroked outline when the tab is
 * idle and a solid silhouette when it is active. Generic icon sets only ship the
 * outline, so the active state ends up as a colour change — switching weight is what
 * makes the selection read instantly. Paths are optically balanced rather than
 * geometrically centred (the house sits 0.4 low, the compass needle is a kite not a
 * rhombus) so all five feel the same size on the bar.
 */
export type NavIconProps = {
  size?: number;
  color: string;
  active?: boolean;
} & SvgProps;

const STROKE = 1.7;

function Frame({ size = 24, children, ...rest }: { size?: number } & SvgProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      {children}
    </Svg>
  );
}

export function HomeIcon({ size, color, active, ...rest }: NavIconProps) {
  const roof = "M3.8 10.6 12 4.15l8.2 6.45V18.6a2.2 2.2 0 0 1-2.2 2.2H6a2.2 2.2 0 0 1-2.2-2.2z";
  return (
    <Frame size={size} {...rest}>
      {active ? (
        <G>
          <Path d={roof} fill={color} />
          {/* door knocked through the silhouette */}
          <Rect
            x={9.75}
            y={15.4}
            width={4.5}
            height={5.4}
            rx={2.25}
            fill="#fff"
            fillOpacity={0.3}
          />
        </G>
      ) : (
        <G stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round">
          <Path d={roof} />
          <Path d="M9.75 20.8v-4.5a2.25 2.25 0 0 1 4.5 0v4.5" />
        </G>
      )}
    </Frame>
  );
}

export function ExploreIcon({ size, color, active, ...rest }: NavIconProps) {
  // a kite, not a rhombus — it reads as a needle with direction
  const needle = "M15.1 8.9 13.5 13.6 8.9 15.1 10.5 10.4z";
  return (
    <Frame size={size} {...rest}>
      {active ? (
        <G>
          <Circle cx={12} cy={12} r={8.6} fill={color} />
          <Path d={needle} fill="#fff" fillOpacity={0.92} />
        </G>
      ) : (
        <G stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round">
          <Circle cx={12} cy={12} r={8.6} />
          <Path d={needle} />
        </G>
      )}
    </Frame>
  );
}

export function EarnIcon({ size, color, active, ...rest }: NavIconProps) {
  const body =
    "M3.4 8.6A2.6 2.6 0 0 1 6 6h11.4A2.6 2.6 0 0 1 20 8.6v7.8a2.6 2.6 0 0 1-2.6 2.6H6a2.6 2.6 0 0 1-2.6-2.6z";
  return (
    <Frame size={size} {...rest}>
      {active ? (
        <G>
          <Path d={body} fill={color} />
          {/* card slot + clasp */}
          <Rect x={14.2} y={10.6} width={7.4} height={4.2} rx={2.1} fill={color} />
          <Circle cx={17.9} cy={12.7} r={1.15} fill="#fff" fillOpacity={0.95} />
        </G>
      ) : (
        <G stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round">
          <Path d={body} />
          <Path d="M20 10.6h1.6a2.1 2.1 0 0 1 0 4.2H20" />
          <Circle cx={17.4} cy={12.7} r={0.95} fill={color} stroke="none" />
        </G>
      )}
    </Frame>
  );
}

export function RewardsIcon({ size, color, active, ...rest }: NavIconProps) {
  const bow =
    "M12 7.2C12 7.2 10.4 3.6 8.3 3.6a2.1 2.1 0 0 0 0 4.2H12zM12 7.2c0 0 1.6-3.6 3.7-3.6a2.1 2.1 0 0 1 0 4.2H12z";
  return (
    <Frame size={size} {...rest}>
      {active ? (
        <G>
          <Path d={bow} fill={color} />
          <Rect x={2.9} y={7.2} width={18.2} height={3.9} rx={1.5} fill={color} />
          <Path
            d="M4.6 11.1h14.8v7.5a2.2 2.2 0 0 1-2.2 2.2H6.8a2.2 2.2 0 0 1-2.2-2.2z"
            fill={color}
          />
          {/* ribbon knocked through the box */}
          <Rect x={10.7} y={7.2} width={2.6} height={13.6} rx={0.6} fill="#fff" fillOpacity={0.3} />
        </G>
      ) : (
        <G stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round">
          <Path d={bow} />
          <Rect x={2.9} y={7.2} width={18.2} height={3.9} rx={1.5} />
          <Path d="M4.6 11.1v7.5a2.2 2.2 0 0 0 2.2 2.2h10.4a2.2 2.2 0 0 0 2.2-2.2v-7.5" />
          <Path d="M12 11.1v9.7" />
        </G>
      )}
    </Frame>
  );
}

export function ProfileIcon({ size, color, active, ...rest }: NavIconProps) {
  const shoulders = "M4.4 20.6a7.6 7.6 0 0 1 15.2 0";
  return (
    <Frame size={size} {...rest}>
      {active ? (
        <G>
          <Circle cx={12} cy={8.3} r={4.05} fill={color} />
          <Path d="M4.4 20.9a7.6 7.6 0 0 1 15.2 0z" fill={color} />
        </G>
      ) : (
        <G stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round">
          <Circle cx={12} cy={8.3} r={4.05} />
          <Path d={shoulders} />
        </G>
      )}
    </Frame>
  );
}

/**
 * RFIN mark — an "R" built from the same arc-and-stem geometry as the brand logo,
 * drawn as one path so it stays crisp at any size.
 */
export function RfinMark({
  size = 40,
  color,
  accent,
}: {
  size?: number;
  color: string;
  accent?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path
        d="M12 41V9.2c0-.66.54-1.2 1.2-1.2h12.9c6.96 0 12.6 5.42 12.6 12.1 0 5.3-3.54 9.8-8.48 11.44"
        stroke={color}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M25.4 31.6 38.4 41" stroke={accent ?? color} strokeWidth={5} strokeLinecap="round" />
    </Svg>
  );
}
