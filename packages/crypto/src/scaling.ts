import { ValidationError } from '@vericred/shared';

export const SCALE_FACTOR = 100;
export const MIN_CGPA = 0;
export const MAX_CGPA = 10;
export const MAX_SCALED_CGPA = 1000;

/**
 * Converts a floating-point CGPA into a fixed-point integer.
 * e.g., 8.72 -> 872
 */
export function scaleCgpa(cgpa: number): number {
  assertValidCgpa(cgpa);
  const scaled = Math.round(cgpa * SCALE_FACTOR);
  assertValidScaledCgpa(scaled);
  return scaled;
}

/**
 * Converts a fixed-point integer back to standard float CGPA.
 * e.g., 872 -> 8.72
 */
export function unscaleCgpa(scaledCgpa: number): number {
  assertValidScaledCgpa(scaledCgpa);
  return scaledCgpa / SCALE_FACTOR;
}

/**
 * Validates that raw CGPA is within the allowed academic domain [0.00, 10.00].
 */
export function assertValidCgpa(cgpa: number): void {
  if (typeof cgpa !== 'number' || Number.isNaN(cgpa)) {
    throw new ValidationError('CGPA must be a valid number');
  }
  if (cgpa < MIN_CGPA || cgpa > MAX_CGPA) {
    throw new ValidationError(`CGPA must be between ${MIN_CGPA.toFixed(2)} and ${MAX_CGPA.toFixed(2)}`);
  }
}

/**
 * Validates that scaled CGPA is an integer within [0, 1000].
 */
export function assertValidScaledCgpa(scaled: number): void {
  if (!Number.isInteger(scaled)) {
    throw new ValidationError('Scaled CGPA must be an integer');
  }
  if (scaled < 0 || scaled > MAX_SCALED_CGPA) {
    throw new ValidationError(`Scaled CGPA must be an integer between 0 and ${MAX_SCALED_CGPA}`);
  }
}
