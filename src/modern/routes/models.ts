import { MembershipSchema, MembershipPeriodSchema } from "./schema";

export interface Membership {
  id: number;
  uuid: string;
  name: string;
  state: string;
  validFrom: Date;
  validUntil: Date;
  // Adding "userId" to match mocked data.
  userId?: number;
  user?: number;
  paymentMethod: string | null;
  recurringPrice: number;
  billingPeriods: number;
  billingInterval: string;
}

export interface MembershipPeriod {
  id: number;
  uuid: string;
  // Adding "membership" to match mocked data.
  membership?: number;
  membershipId?: number;
  start: Date;
  end: Date;
  state: string;
}

export interface AddMembershipResponse {
  membership: Membership;
  membershipPeriods: Array<MembershipPeriod>;
}

export interface GetMembershipResponse {
  membership: MembershipSchema;
  periods: Array<MembershipPeriodSchema>;
}

export enum BillingEnum {
  monthly = 1,
  yearly = 12,
  weekly = 7,
}
