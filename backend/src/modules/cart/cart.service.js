import Cart from "./cart.model.js";
import ApiError from "../../common/utils/api-error.js";

const getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], totalPrice: 0 });
  }
  return cart;
};

const addToCart = async (userId, { productId, quantity, price }) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = new Cart({ user: userId, items: [], totalPrice: 0 });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId.toString()
  );

  if (itemIndex > -1) {
    // Product exists in cart, update quantity
    cart.items[itemIndex].quantity += quantity;
  } else {
    // Product does not exist, add new item
    cart.items.push({ product: productId, quantity, price });
  }

  await cart.save();
  return cart;
};

const removeFromCart = async (userId, productId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) throw ApiError.notfound("Cart not found");

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId.toString()
  );

  await cart.save();
  return cart;
};

const clearCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) throw ApiError.notfound("Cart not found");

  cart.items = [];
  cart.totalPrice = 0;
  
  await cart.save();
  return cart;
};

export { getCart, addToCart, removeFromCart, clearCart };
