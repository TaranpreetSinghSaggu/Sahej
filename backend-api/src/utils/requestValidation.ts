import { AppError } from "../middleware/error.middleware";
import { REFLECTION_PATTERNS } from "../types/consequencePreview";
import { ReflectionPattern } from "../types/reflection";
import { VolumeTrend, VOLUME_TRENDS } from "../types/voiceState";

interface IntegerOptions {
  min?: number;
  max?: number;
}

export const getRequiredTrimmedText = (value: unknown, fieldName: string): string => {
  if (typeof value !== "string") {
    throw new AppError(400, `${fieldName} is required and must be a string`);
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    throw new AppError(400, `${fieldName} must not be empty`);
  }

  if (trimmedValue.length > 1000) {
    throw new AppError(400, `${fieldName} must be 1000 characters or fewer`);
  }

  return trimmedValue;
};

export const getOptionalBoolean = (
  value: unknown,
  fieldName: string
): boolean | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "boolean") {
    throw new AppError(400, `${fieldName} must be a boolean`);
  }

  return value;
};

export const getOptionalInteger = (
  value: unknown,
  fieldName: string,
  options: IntegerOptions = {}
): number | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (!Number.isInteger(value)) {
    throw new AppError(400, `${fieldName} must be an integer`);
  }

  const numericValue = value as number;

  if (options.min !== undefined && numericValue < options.min) {
    throw new AppError(400, `${fieldName} must be at least ${options.min}`);
  }

  if (options.max !== undefined && numericValue > options.max) {
    throw new AppError(400, `${fieldName} must be at most ${options.max}`);
  }

  return numericValue;
};

export const getOptionalReflectionPattern = (
  value: unknown,
  fieldName: string
): ReflectionPattern | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" || !REFLECTION_PATTERNS.includes(value as ReflectionPattern)) {
    throw new AppError(400, `${fieldName} must be a valid reflection pattern`);
  }

  return value as ReflectionPattern;
};

export const getOptionalVolumeTrend = (
  value: unknown,
  fieldName: string
): VolumeTrend | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" || !VOLUME_TRENDS.includes(value as VolumeTrend)) {
    throw new AppError(400, `${fieldName} must be a valid volume trend`);
  }

  return value as VolumeTrend;
};
