export const Spacing = {
  // Base spacing unit (4px) - all spacing should be multiples of 4px
  unit: 4,
  
  // Modern spacing scale
  xs: 4,      // tight spacing within components
  sm: 8,      // minimal gaps
  md: 12,     // default gap between related items
  lg: 16,     // standard padding
  xl: 20,     // section padding
  '2xl': 24,  // card padding, major sections
  '3xl': 32,  // large section breaks
  '4xl': 40,  // hero sections
  '5xl': 48,  // extra large spacing
  '6xl': 64,  // massive spacing
  
  // Common use cases
  screen: 20,      // Screen content padding (increased for modern feel)
  card: 24,        // Card inner padding (generous padding)
  section: 24,     // Section spacing
  component: 12,   // Component spacing
  safeArea: {
    top: 20,
    bottom: 120,   // Space for bottom nav + safe area
    sides: 20,
  },
};

export const BorderRadius = {
  // Modern border radius values (min 8px for personality)
  xs: 8,      // small buttons, badges
  sm: 10,     // icon containers, small cards
  md: 12,     // input fields, buttons (standard)
  lg: 14,     // icon badges (44-48px containers)
  xl: 16,     // standard cards, buttons
  '2xl': 20,  // large cards
  '3xl': 24,  // modals, bottom sheets (top corners)
  '4xl': 28,  // avatar alternatives
  '5xl': 32,  // large modals, screen corners
  full: 9999, // fully rounded
};

export const Elevation = {
  none: 0,
  subtle: 1,   // Default cards, list items
  light: 2,    // Hovered cards, input focus
  medium: 3,   // Important cards, overlays
  high: 4,     // Modals, dropdowns, floating buttons
  intense: 5,  // Maximum elevation
};