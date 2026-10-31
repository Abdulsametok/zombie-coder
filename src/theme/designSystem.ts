/**
 * Zombie Coder — Stitch Design System Tokens (from DESIGN.md)
 * Cyberpunk Terminal UI + Tactile Retro-Modern Sim Controls
 */

export const Colors = {
  surface: '#0f131d',
  surfaceDim: '#0f131d',
  surfaceBright: '#353944',
  surfaceContainerLowest: '#0a0e18',
  surfaceContainerLow: '#171b26',
  surfaceContainer: '#1c1f2a',
  surfaceContainerHigh: '#262a35',
  surfaceContainerHighest: '#313540',
  surfaceVariant: '#313540',
  onSurface: '#dfe2f1',
  onSurfaceVariant: '#b9ccb5',
  outline: '#849581',
  outlineVariant: '#3b4b3a',

  primary: '#edffe8',
  onPrimary: '#003911',
  primaryContainer: '#00ff66',
  onPrimaryContainer: '#007128',
  primaryFixed: '#6bff83',
  primaryFixedDim: '#00e55b',

  secondary: '#4cd7f6',
  onSecondary: '#003640',
  secondaryContainer: '#03b5d3',
  onSecondaryContainer: '#00424e',
  secondaryFixed: '#acedff',
  secondaryFixedDim: '#4cd7f6',

  tertiary: '#fff8fd',
  tertiaryContainer: '#edd4ff',
  tertiaryFixedDim: '#ddb7ff',
  necrosisPurple: '#a855f7',

  warning: '#f59e0b',
  error: '#ffb4ab',
  errorBright: '#ef4444',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
} as const;

export const Radii = {
  sm: 2,
  md: 4,
  lg: 8,
  xl: 12,
  full: 9999,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;
