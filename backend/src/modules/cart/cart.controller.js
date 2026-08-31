import apiResponse from "../../common/utils/api-response.js";
import * as cartService from "./cart.service.js";

const getCart = async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  apiResponse.ok(res, "Cart fetched successfully", cart);
};

const addToCart = async (req, res) => {
  const cart = await cartService.addToCart(req.user.id, req.body);
  apiResponse.ok(res, "Item added to cart", cart);
};

const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  const cart = await cartService.removeFromCart(req.user.id, productId);
  apiResponse.ok(res, "Item removed from cart", cart);
};

const clearCart = async (req, res) => {
  const cart = await cartService.clearCart(req.user.id);
  apiResponse.ok(res, "Cart cleared successfully", cart);
};

export { getCart, addToCart, removeFromCart, clearCart };
