import { Request } from "express";

export interface TypedRequestBody<T> extends Request {
  body: T;
}

export interface MembershipInput {
  name: string;
  paymentMethod: string;
  recurringPrice: number;
  billingPeriods: number;
  billingInterval: string;
  validFrom: string;
}
