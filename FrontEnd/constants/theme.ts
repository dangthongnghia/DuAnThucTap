export type Themes = keyof typeof themes;

export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
} as const;

export const display = {
  // No "[Scale: Display]" variable collection found
} as const;

export const typography = {
  // No "[Scale: Fonts]" variable collection found
} as const;

export const font = {
  // No "Fonts" variable collection found
} as const;

export const palette = {
  // No "[Scale: Colors]" variable collection found
} as const;

export const themes = {
  main: {
    colors: {
      baseLightLight20: '#91919f',
      baseLightLight40: '#e3e5e5',
      baseLightLight60: '#f1f1fa',
      baseLightLight80: '#fcfcfc',
      baseLightLight100: '#ffffff',
      baseDarkDark100: '#0d0e0f',
      baseDarkDark75: '#161719',
      baseDarkDark50: '#212325',
      baseDarkDark25: '#292b2d',
      violetViolet100: '#7f3dff',
      violetViolet80: '#8f57ff',
      violetViolet60: '#b18aff',
      violetViolet40: '#d3bdff',
      violetViolet20: '#eee5ff',
      blueBlue100: '#0077ff',
      blueBlue80: '#248aff',
      blueBlue60: '#57a5ff',
      blueBlue40: '#8ac0ff',
      blueBlue20: '#bddcff',
      redRed100: '#fd3c4a',
      redRed80: '#fd5662',
      redRed60: '#fd6f7a',
      redRed40: '#fda2a9',
      redRed20: '#fdd5d7',
      greenGreen100: '#00a86b',
      greenGreen80: '#2ab784',
      greenGreen60: '#65d1aa',
      greenGreen40: '#93eaca',
      greenGreen20: '#cffaea',
      yellowYellow100: '#fcac12',
      yellowYellow80: '#fcbb3c',
      yellowYellow60: '#fccc6f',
      yellowYellow40: '#fcdda1',
      yellowYellow20: '#fceed4',
      gradientFadedPurple: '#000000',
    },
    breakpoints,
    display,
    font,
    palette,
    typography,
  },
} as const;

export const initialTheme: Themes = 'main' as const;

// convenient aliases
export const theme = themes[initialTheme];
export const ui = {
  primary: theme.colors.violetViolet100,
  primaryVariant: theme.colors.violetViolet80,
  onPrimary: theme.colors.baseLightLight100,
  background: theme.colors.baseLightLight80,
  surface: theme.colors.baseLightLight100,
  text: theme.colors.baseDarkDark100,
  muted: theme.colors.baseLightLight20,
  border: theme.colors.baseLightLight40,
  success: theme.colors.greenGreen100,
  warning: theme.colors.yellowYellow100,
  danger: theme.colors.redRed100,
  info: theme.colors.blueBlue100,
};