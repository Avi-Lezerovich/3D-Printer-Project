import { tokens } from '../design-system';

export function useSpacing() {
  const getSpacing = (size: keyof typeof tokens.spacing): string => {
    return `${tokens.spacing[size]}px`;
  };

  const getSpacingRem = (size: keyof typeof tokens.spacing): string => {
    return `${tokens.spacing[size] / 16}rem`;
  };

  const getMultipleSpacing = (...sizes: (keyof typeof tokens.spacing)[]): string => {
    return sizes.map(size => `${tokens.spacing[size]}px`).join(' ');
  };

  return {
    spacing: tokens.spacing,
    getSpacing,
    getSpacingRem,
    getMultipleSpacing,
  };
}