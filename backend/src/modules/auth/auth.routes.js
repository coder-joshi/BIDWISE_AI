import { Router } from "express";
import * as controller from "./auth.controller.js";
import validateDto from "../../common/middleware/validate.middleware.js";
import RegisterDto from "./dto/register.dto.js";
import { authenticate } from "./auth.middleware.js";
import LoginDto from "./dto/login.dto.js";
import ForgotPasswordDto from "./dto/forgot-password.dto.js";
import VerifyEmailDto from "./dto/verify-email.dto.js";
import ResetPasswordDto from "./dto/reset-password.dtp.js";
const router = Router();

router.post("/register", validateDto(RegisterDto), controller.register);
router.post("/login", validateDto(LoginDto), controller.login);
router.post("/logout", authenticate, controller.logout);
router.get("/me", authenticate, controller.getMe);
router.post("/refresh", controller.refresh);
router.post(
  "/forgot-password",
  validateDto(ForgotPasswordDto),
  controller.forgotPassword,
);
router.post(
  "/verify-email",
  validateDto(VerifyEmailDto),
  controller.verifyEmail,
);
router.post(
  "/reset-password",
  validateDto(ResetPasswordDto),
  controller.resetPassword,
);
export default router;
