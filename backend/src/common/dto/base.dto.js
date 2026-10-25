import Joi from "joi";

const DANGEROUS_INPUT_REGEX = /<\s*\/?\s*script\b|javascript\s*:|on[a-z]+\s*=/i;

function detectDangerousPayload(input, pathPrefix = "") {
  if (typeof input === "string") {
    if (DANGEROUS_INPUT_REGEX.test(input)) {
      return `Field "${pathPrefix || "value"}" contains disallowed script or HTML event payload`;
    }
    return null;
  }

  if (Array.isArray(input)) {
    for (let i = 0; i < input.length; i++) {
      const found = detectDangerousPayload(input[i], `${pathPrefix}[${i}]`);
      if (found) return found;
    }
    return null;
  }

  if (input && typeof input === "object" && !(input instanceof Date)) {
    for (const [key, val] of Object.entries(input)) {
      if (key.startsWith("$") || key.includes(".")) {
        return `Field "${key}" contains disallowed query operator characters`;
      }
      const nextPath = pathPrefix ? `${pathPrefix}.${key}` : key;
      const found = detectDangerousPayload(val, nextPath);
      if (found) return found;
    }
  }

  return null;
}

class BaseDto {
  static schema = Joi.object({});

  static validateData(data) {
    const payloadError = detectDangerousPayload(data);
    if (payloadError) {
      return { errors: [payloadError], value: null };
    }

    const { error, value } = this.schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((d) => d.message);
      return { errors, value: null };
    }
    return { errors: null, value };
  }
}

export default BaseDto;
