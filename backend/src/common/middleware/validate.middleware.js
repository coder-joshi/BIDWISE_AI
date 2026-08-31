import apiError from "../utils/api-error.js";

const validateDto = (dtoClass) => {
  return (req, res, next) => {
    const { errors, value } = dtoClass.validateData(req.body);
    if (errors) {
      throw apiError.badRequest(errors.join("; "));
    }
    req.body = value;
    next();
  };
};

export default validateDto;
