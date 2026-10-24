import ApiError from "../utils/api-error.js";

const validateDto = (dtoOrConfig, defaultTarget = "body") => {
  return (req, res, next) => {
    req.validated = req.validated || {};

    const configs =
      typeof dtoOrConfig === "function"
        ? [{ dto: dtoOrConfig, target: defaultTarget }]
        : Object.entries(dtoOrConfig)
            .filter(([, dto]) => Boolean(dto))
            .map(([target, dto]) => ({ dto, target }));

    const errorMessages = [];

    for (const { dto, target } of configs) {
      const sourceData = req[target] || {};
      const { errors, value } = dto.validateData(sourceData);

      if (errors) {
        errorMessages.push(...errors);
      } else {
        req.validated[target] = value;
        if (target === "body") {
          req.body = value;
        }
      }
    }

    if (errorMessages.length > 0) {
      throw ApiError.badRequest(errorMessages.join("; "));
    }

    next();
  };
};

export default validateDto;
