import { Request, Response } from "express";
import { addressSchema, updateUserSchema } from "../schema/users";
import { User } from "@prisma/client";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCode } from "../exceptions/root";
import { CustomRequest } from "../types/express";
import { BadRequestException } from "../exceptions/bad-requests";
import { ALLOWED_ROLES } from "../constants/roles.constant";

export const addAddress = async (req: CustomRequest, res: Response) => {
  addressSchema.parse(req.body);
  let user: User;
  const address = await prismaClient.address.create({
    data: {
      ...req.body,
      userId: req.user?.id,
    },
  });
  res.status(201).json(address);
};
export const deleteAddress = async (req: Request, res: Response) => {
  const addressId = Number(req.params.id);
  if (isNaN(addressId)) {
    throw new BadRequestException(
      "Invalid address Id",
      ErrorCode.INVALID_INPUT
    );
  }
  const existingAddress = await prismaClient.address.findUnique({
    where: { id: addressId },
  });
  if (!existingAddress) {
    throw new NotFoundException(
      "Address not found",
      ErrorCode.ADDRESS_NOT_FOUND
    );
  }
  await prismaClient.address.delete({
    where: {
      id: addressId,
    },
  });
  res
    .status(200)
    .json({ success: true, message: "Address deleted successfully" });
};
export const listAddress = async (req: CustomRequest, res: Response) => {
  const userId = req.user?.id;
  const addresses = await prismaClient.address.findMany({
    where: {
      userId,
    },
  });

  res.status(200).json({
    success: true,
    message: "Addresses fetched successfully",
    data: addresses,
  });
};
export const updateUser = async (req: CustomRequest, res: Response) => {
  let validateData = updateUserSchema.parse(req.body);
  let shippingAddress;
  let billingAddress;
  let updateData: User = req.user!;

  if (!isNaN(validateData.defaultShippingAddress!)) {
    shippingAddress = await prismaClient.address.findUnique({
      where: {
        id: validateData.defaultShippingAddress!,
      },
    });

    if (!shippingAddress) {
      throw new NotFoundException(
        "Address not found.",
        ErrorCode.ADDRESS_NOT_FOUND
      );
    }
    if (shippingAddress.userId !== req.user?.id) {
      throw new NotFoundException(
        "Address does not belong to user.",
        ErrorCode.ADDRESS_DOES_NOT_BELONG
      );
    }
    updateData = { ...req.user, defaultShippingAddress: shippingAddress.id };
  }
  if (!isNaN(validateData.defaultBillingAddress!)) {
    billingAddress = await prismaClient.address.findUnique({
      where: {
        id: validateData.defaultBillingAddress!,
      },
    });
    if (!billingAddress) {
      throw new NotFoundException(
        "Address not found.",
        ErrorCode.ADDRESS_NOT_FOUND
      );
    }
    if (billingAddress.userId !== req.user?.id) {
      throw new NotFoundException(
        "Address does not belong to user.",
        ErrorCode.ADDRESS_DOES_NOT_BELONG
      );
    }
    updateData = { ...req.user, defaultBillingAddress: billingAddress.id };
  }
  if (validateData.name) updateData.name = validateData.name;

  const updatedUser = await prismaClient.user.update({
    where: { id: req.user?.id },
    data: updateData,
  });

  res.status(200).json({ success: true });
};

export const listUsers = async (req: Request, res: Response) => {
  let users;
  let skip = req.query.skip ? Number(req.query.skip) : 0;
  users = await prismaClient.user.findMany({
    skip,
    take: 5,
  });
  res.status(200).json({ users });
};

export const getUserById = async (req: Request, res: Response) => {
  let user;
  try {
    user = await prismaClient.user.findFirstOrThrow({
      where: {
        id: +req.params.id,
      },
      include: {
        addresses: true,
      },
    });
  } catch (err) {
    throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);
  }
  res.status(200).json({ user });
};

export const changeUserRole = async (req: Request, res: Response) => {
  if (
    !req.params.id ||
    isNaN(Number(req.params.id)) ||
    Number(req.params.id) <= 0
  ) {
    throw new BadRequestException("Invalid user ID", ErrorCode.INVALID_INPUT);
  }
  const userId = Number(req.params.id);
  const { role } = req.body;
  if (!role) {
    throw new BadRequestException("Role is required", ErrorCode.INVALID_INPUT);
  }
  const normalizedRole = role.toUpperCase();
  if (!ALLOWED_ROLES.includes(normalizedRole)) {
    throw new BadRequestException("Invalid role", ErrorCode.INVALID_ROLE);
  }
  const existingUser = await prismaClient.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new NotFoundException("User not found", ErrorCode.USER_NOT_FOUND);
  }
  const user = await prismaClient.user.update({
    where: { id: userId },
    data: { role: normalizedRole },
  });
  res.status(200).json({
    success: true,
    data: { ...user },
    message: "User role updated successfully",
  });
};
