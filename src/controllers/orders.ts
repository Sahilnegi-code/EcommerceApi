import { Response } from "express";
import { CustomRequest } from "../types/express";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { BadRequestException } from "../exceptions/bad-requests";
import { OrderEventStatus } from "@prisma/client";
import { stat } from "fs";

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
  const orders = await prismaClient.order.findMany({
    where: {
      userId: req.user?.id,
    },
  });
  res.status(200).json(orders);
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
  const orderId = req.params.id;
  if (!orderId || isNaN(+orderId)) {
    throw new BadRequestException(
      "Order ID is required and must be a valid number",
      ErrorCode.INVALID_INPUT
    );
  }
  const order = await prismaClient.order.findUnique({
    where: {
      id: +req.params.id,
      userId: req.user?.id,
    },
    include: {
      products: true,
      events: true,
    },
  });

  if (!order) {
    throw new NotFoundException("Order not found", ErrorCode.ORDER_NOT_FOUND);
  }

  res.status(200).json({
    success: true,
    data: order,
    message: "Order fetched successfully",
  });
};

export const listAllOrders = async (req: CustomRequest, res: Response) => {
  let status = req.query["status"] as string | undefined;
  let take = req.query["limit"] ? Number(req.query.limit) : 10;
  let skip = req.query["skip"] ? Number(req.query.skip) : 0;

  if (!status) {
    throw new BadRequestException(
      "Status is required",
      ErrorCode.INVALID_INPUT
    );
  }
  status = status.toString().toUpperCase();
  if (Object.values(OrderEventStatus).includes(status as OrderEventStatus)) {
    throw new BadRequestException(
      "Invalid order status",
      ErrorCode.INVALID_INPUT
    );
  }

  const totalOrders = await prismaClient.order.count({
    where: {
      status: status as OrderEventStatus,
    },
  });

  const orders = await prismaClient.order.findMany({
    where: {
      status: status as OrderEventStatus,
    },
    skip,
    take,
  });

  res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    totalOrders,
    limit: take,
    skip: skip,
    data: orders,
  });
};

export const changeStatus = async (req: CustomRequest, res: Response) => {
  const orderId = req.params.id;
  const orderStatus = req.body.status;
  if (!orderId || isNaN(+orderId) || +orderId < 0) {
    throw new BadRequestException(
      "Order ID is required and must be a valid number",
      ErrorCode.INVALID_INPUT
    );
  }

  if (!orderStatus) {
    throw new BadRequestException(
      "Order status is required",
      ErrorCode.INVALID_INPUT
    );
  }
  const modifiedStatus = orderStatus.toUpperCase();
  const order = await prismaClient.order.update({
    where: {
      id: +req.params.id,
    },
    data: {
      status: modifiedStatus,
    },
  });

  await prismaClient.orderEvent.create({
    data: {
      orderId: order.id,
      status: modifiedStatus,
    },
  });
  res.status(200).json({ order });
};

export const listUserOrders = async (req: CustomRequest, res: Response) => {
  const userId = req.params.id;
  if (!userId || isNaN(+userId)) {
    throw new BadRequestException(
      "User ID is required and must be a valid number",
      ErrorCode.INVALID_INPUT
    );
  }
  let status = req.query.status;
  if (!status || typeof status !== "string") {
    throw new BadRequestException(
      "Status is required",
      ErrorCode.INVALID_INPUT
    );
  }
  status = status.toUpperCase();
  if (!Object.values(OrderEventStatus).includes(status as OrderEventStatus)) {
    throw new BadRequestException(
      "Invalid order status",
      ErrorCode.INVALID_INPUT
    );
  }
  const orders = await prismaClient.order.findMany({
    where: {
      userId: +userId,
      status: status as OrderEventStatus,
    },
    skip: +(req.query.skip as string) || 0,
    take: 5,
  });
  res.status(200).json({ orders });
};
