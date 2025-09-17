import { Product } from "@prisma/client";
import { cartItemSchema, changeQuantitySchema } from "../schema/cart";
import { Request, Response } from "express";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { CustomRequest } from "../types/express";

export const addItemToCart = async (req: CustomRequest, res: Response) => {
  if (!req.user || !req.user.id) {
    throw new NotFoundException("Not found exception", ErrorCode.UNAUTHORIZED);
  }
  const validateData = cartItemSchema.parse(req.body);
  let product: Product;
  try {
    product = await prismaClient.product.findFirstOrThrow({
      where: {
        id: validateData.productId,
      },
    });
  } catch (err) {
    throw new NotFoundException(
      "Product not found!",
      ErrorCode.PRODUCT_NOT_FOUND
    );
  }
  const cart = await prismaClient.cartItem.create({
    data: {
      userId: req.user?.id,
      productId: product.id,
      quantity: validateData.quantity,
    },
  });
  res.status(200).json(cart);
};

export const deleteItemFromCart = async (req: CustomRequest, res: Response) => {
  const cartItemId = Number(req.params.id);
  const cartItem = await prismaClient.cartItem.findFirst({
    where: { id: cartItemId, userId: req.user?.id },
  });
  if (!cartItem) {
    throw new NotFoundException(
      "Cart item not found or does not belong to you",
      ErrorCode.CART_ITEM_NOT_FOUND
    );
  }
  const deletedCartItem = await prismaClient.cartItem.delete({
    where: { id: cartItemId, userId: req.user?.id },
  });
  return res.status(200).json({ success: true });
};

export const changeQuantity = async (req: Request, res: Response) => {
  const validateData = changeQuantitySchema.parse(req.body);
  const isCartItemExist = await prismaClient.cartItem.findFirst({
    where: {
      id: +req.params.id,
    },
  });

  if (!isCartItemExist) {
    throw new NotFoundException(
      "Cart item not found!",
      ErrorCode.CART_ITEM_NOT_FOUND
    );
  }

  const updatedCart = await prismaClient.cartItem.update({
    where: {
      id: +req.params.id,
    },
    data: {
      quantity: validateData.quantity,
    },
  });

  res.status(200).json(updatedCart);
};

export const getCart = async (req: CustomRequest, res: Response) => {
  if (req.user && req.user.id) {
    const cart = await prismaClient.cartItem.findMany({
      where: {
        userId: +req.user.id,
      },
      include: {
        product: true,
      },
    });
    res.status(200).json({
      success: true,
      data: cart,
      message: "Cart fetched successfully",
    });
  }
};
