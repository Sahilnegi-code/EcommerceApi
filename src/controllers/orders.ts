import { Response } from "express";
import { CustomRequest } from "../types/express";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { BadRequestException } from "../exceptions/bad-requests";

export const createOrder = async (req: CustomRequest, res: Response) => {
  return await prismaClient.$transaction(async (trx) => {
    const cartItem = await trx.cartItem.findMany({
      where: {
        userId: req.user?.id,
      },
      include: {
        product: true,
      },
    });

    if (!cartItem.length) {
      throw new BadRequestException("Cart is empty", ErrorCode.CART_EMPTY);
    }

    if (req.user!.defaultShippingAddress === null) {
      throw new BadRequestException(
        "Default shipping address not set",
        ErrorCode.ADDRESS_NOT_FOUND
      );
    }
    const price = cartItem.reduce((acc, curr) => {
      return acc + curr.quantity * +curr.product.price;
    }, 0);

    let address = null;
    address = await trx.address.findUnique({
      where: {
        id: req.user!.defaultShippingAddress!,
      },
    });
    if (!address) {
      throw new NotFoundException(
        "Default shipping address not found",
        ErrorCode.ADDRESS_NOT_FOUND
      );
    }
    let order = undefined;
    order = await trx.order.create({
      data: {
        user: {
          connect: { id: req.user?.id },
        },
        netAmount: price,
        address: address.formatAddress,
        products: {
          create: cartItem.map((cart) => {
            return {
              productId: cart.productId,
              quantity: cart.quantity,
            };
          }),
        },
      },
    });
    const orderEvent = await trx.orderEvent.create({
      data: {
        order: {
          connect: { id: order.id },
        },
      },
    });

    await trx.cartItem.deleteMany({
      where: {
        userId: req.user!.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  });
};
export const listOrders = async (req: CustomRequest, res: Response) => {
  try {
    const orders = await prismaClient.order.findMany({
      where: {
        userId: req.user?.id,
      },
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
export const cancelOrder = async (req: CustomRequest, res: Response) => {
  try {
    const order = await prismaClient.order.update({
      where: {
        id: +req.params.id,
      },
      data: {
        status: "CANCELLED",
      },
    });

    await prismaClient.orderEvent.create({
      data: {
        orderId: order.id,
        status: "CANCELLED",
      },
    });
    res.status(200).json(order);
  } catch (err) {
    throw new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND);
  }
};

export const getOrderById = async (req: CustomRequest, res: Response) => {
  try {
    const order = await prismaClient.order.findFirstOrThrow({
      where: {
        id: +req.params.id,
      },
      include: {
        products: true,
        events: true,
      },
    });

    res.status(200).json(order);
  } catch (err) {
    throw new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND);
  }
};

export const listAllOrders = async (req: CustomRequest, res: Response) => {
  let whereClause = {};
  const status = req.query.status;
  if (status) {
    whereClause = { status };
  }
  let skip = +(req.query.skip as string) || 0;
  const orders = await prismaClient.order.findMany({
    where: whereClause,
    skip,
    take: 10,
  });
  res.status(200).json(orders);
};

export const changeStatus = async (req: CustomRequest, res: Response) => {
  try {
    const order = await prismaClient.order.update({
      where: {
        id: +req.params.id,
      },
      data: {
        status: req.body.status,
      },
    });

    await prismaClient.orderEvent.create({
      data: {
        orderId: order.id,
        status: req.body.status,
      },
    });
    res.status(200).json({ order });
  } catch (err) {
    throw new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND);
  }
};

export const listUserOrders = async (req: CustomRequest, res: Response) => {
  let whereClause: any = {
    userId: +req.params.id,
  };
  const status = req.params.status;
  if (status) {
    whereClause = {
      ...whereClause,
      status,
    };
  }
  const orders = await prismaClient.order.findMany({
    where: whereClause,
    skip: +(req.query.skip as string) || 0,
    take: 5,
  });
  res.status(200).json({ orders });
};
