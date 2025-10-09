import { Colors } from './colors';
import { Typography } from './typography';
import { Spacing, BorderRadius, Elevation } from './spacing';

export const Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  elevation: Elevation,
};

export { Colors, Typography, Spacing, BorderRadius, Elevation };

// Common shadow styles for consistency
export const Shadows = {
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: Elevation.sm,
  },
  md: {
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: Elevation.md,
  },
  lg: {
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: Elevation.lg,
  },
};