import { ErrorCode } from "../exceptions/root";
import { prismaClient } from "../index";
import { Request, Response } from "express";
import { NotFoundException } from "../exceptions/not-found";

interface Error {
  name: string;
  message: string;
  stack?: string;
}
export const createProduct = async (req: Request, res: Response) => {
  const Product = await prismaClient.product.create({
    data: {
      ...req.body,
      tags: req.body.tags.join(","),
    },
  });
  res.status(201).json({ Product });
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const Product = req.body;
    if (Product.tags) {
      Product.tags = Product.tags.join(",");
    }
    const updatedProduct = await prismaClient.product.update({
      where: { id: +req.params.id },
      data: Product,
    });
    res.status(201).json({ updatedProduct });
  } catch (error) {
    throw new NotFoundException(
      "Product not found",
      ErrorCode.PRODUCT_NOT_FOUND
    );
  }
};

export const listProducts = async (req: Request, res: Response) => {
  const count = await prismaClient.product.count();
  const products = await prismaClient.product.findMany({
    skip: req.query.skip ? Number(req.query.skip) : 0,
    take: 5,
  });
  res.status(200).json({ count, data: products });
};

export const deleteProduct = async (req: Request, res: Response) => {
  const deletedProduct = await prismaClient.product.findUnique({
    where: {
      id: +req.params.id,
    },
  });
  if (!deletedProduct) {
    throw new NotFoundException(
      "Product not found",
      ErrorCode.PRODUCT_NOT_FOUND
    );
  }
  await prismaClient.product.delete({
    where: {
      id: +req.params.id,
    },
  });
  res.status(200).json({ message: "Product deleted successfully" });
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prismaClient.product.findFirstOrThrow({
      where: {
        id: +req.params.id,
      },
    });
    res.status(200).json({
      product: product,
    });
  } catch (err: any) {
    throw new NotFoundException(
      "Product not found.",
      ErrorCode.PRODUCT_NOT_FOUND
    );
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  const products = await prismaClient.product.findMany({
    where: {
      name: {
        search: req.query.q as string,
      },
      description: {
        search: req.query.q as string,
      },
      tags: {
        search: req.query.q as string,
      },
    },
  });
  res.status(200).json({ data: products });
};
