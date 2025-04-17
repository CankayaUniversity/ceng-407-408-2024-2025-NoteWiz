// src/components/icons/index.tsx
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export interface IconProps {
  color?: string;
  size?: number;
  style?: any;
}

export const HomeIcon: React.FC<IconProps> = ({ color = '#666', size = 24, style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const NotesIcon: React.FC<IconProps> = ({ color = '#666', size = 24, style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ color = '#666', size = 24, style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx={12} cy={12} r={3} stroke={color} strokeWidth={2} />
    <Path
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"
      stroke={color}
      strokeWidth={2}
    />
  </Svg>
);

export const StarIcon: React.FC<IconProps> = ({ color = '#FFD700', size = 24, style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      stroke={color}
      fill={color}
      strokeWidth={2}
    />
  </Svg>
);

export const SearchIcon: React.FC<IconProps> = ({ color = '#666', size = 24, style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CreateIcon: React.FC<IconProps> = ({ color = '#666', size = 24, style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M12 5v14M5 12h14"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ImageIcon: React.FC<IconProps> = ({ color = '#666', size = 24, style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 15l-5-5L5 21"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CloudIcon: React.FC<IconProps> = ({ color = '#666', size = 24, style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Path
      d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const TimeIcon: React.FC<IconProps> = ({ color = '#666', size = 24, style }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
    <Path
      d="M12 6v6l4 2"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);