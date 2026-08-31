import apiResponse from "../../common/utils/api-response.js";
import * as authService from "./auth.service.js";

const register = async (req, res) => {
  const user = await authService.register(req.body);
  apiResponse.created(res, "Successful", user);
};

const login = async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  apiResponse.ok(res, "Login successful", { user, accessToken });
};

const logout = async (req, res) => {
  await authService.logout(req.user.id);
  res.clearCookie("refreshToken");
  apiResponse.ok(res, "Logout Success");
};

const getMe = async (req, res) => {
  apiResponse.ok(res, "User profile fetched successfully", req.user);
};

const refresh = async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  const { accessToken } = await authService.refresh(token); //new access token
  apiResponse.ok(res, "Token refreshed successfully", { accessToken });
};

const forgotPassword = async (req, res) => {
  await authService.forgotPassword(req.body.email);
  apiResponse.ok(res, "Password reset email sent if account exists");
};

const verifyEmail = async (req, res) => {
  await authService.verificationEmail(req.body.token);
  apiResponse.ok(res, "Email verified successfully");
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  await authService.resetPassword(token, newPassword);

  apiResponse.ok(res, "Password reset successfully. You can now log in.");
};

export {
  register,
  login,
  logout,
  getMe,
  refresh,
  forgotPassword,
  verifyEmail,
  resetPassword,
};
