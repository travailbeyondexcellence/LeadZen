import { Colors } from './colors';

export const createLinearGradient = (colors: string[], angle: number = 135) => {
  // React Native uses a different gradient system
  // This is a utility to help with gradient definitions
  return {
    colors: colors,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 }, // 135 degree equivalent
  };
};

export const Gradients = {
  primary: createLinearGradient(Colors.gradients.primary),
  sunset: createLinearGradient(Colors.gradients.sunset),
  ocean: createLinearGradient(Colors.gradients.ocean),
  fresh: createLinearGradient(Colors.gradients.fresh),
  aurora: createLinearGradient(Colors.gradients.aurora),
  fire: createLinearGradient(Colors.gradients.fire),
};

// Gradient backgrounds for components
export const GradientBackgrounds = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  sunset: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  ocean: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  fresh: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  aurora: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 50%, #2BFF88 100%)',
  fire: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%)',
};