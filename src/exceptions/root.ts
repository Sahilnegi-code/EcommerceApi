export class HttpException extends Error {
  message: string;
  errorCode: any;
  statusCode: number;
  errors: ErrorCode;
  constructor(
    message: string,
    errorCode: ErrorCode,
    statusCode: any,
    errors: any
  ) {
    super();
    this.message = message;
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
export enum ErrorCode {
  ADDRESS_DOES_NOT_BELONG = 1009,
  USER_NOT_FOUND = 1001,
  USER_ALREADY_EXISTS = 1002,
  INCORRECT_PASSWORD = 1003,
  UNPROCESSABLE_ENTITY = 1004,
  INTERNAL_EXCEPTION = 1005,
  UNAUTHORIZED = 1006,
  PRODUCT_NOT_FOUND = 1007,
  ADDRESS_NOT_FOUND = 1008,
  ORDER_NOT_FOUND = 1009,
  CART_ITEM_NOT_FOUND = 1010,
  CART_EMPTY = 1011,
  INVALID_INPUT = 1012,
  INVALID_ROLE = 1013,
}
