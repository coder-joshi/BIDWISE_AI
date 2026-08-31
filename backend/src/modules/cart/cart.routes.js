import { Router } from "express";
import * as controller from "./cart.controller.js";
import { authenticate } from "../auth/auth.middleware.js";

const router = Router();

router.use(authenticate); // All cart routes require authentication

router.get("/", controller.getCart);
router.post("/", controller.addToCart);
router.delete("/:productId", controller.removeFromCart);
router.delete("/", controller.clearCart);

export default router;
