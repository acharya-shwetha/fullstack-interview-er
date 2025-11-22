export interface MembershipSchema {
  id: number;
  uuid: string;
  name: string;
  state: string;
  // Supporting both string and Date type to
  // match mocked data and addition via API.
  validFrom: Date | string;
  validUntil: Date | string;
  // Adding "userId" to match mocked data.
  userId?: number;
  user?: number;
  assignedBy?: string;
  paymentMethod: string | null;
  recurringPrice: number;
  billingPeriods: number;
  billingInterval: string;
}

export interface MembershipPeriodSchema {
  id: number;
  uuid: string;
  // Adding "membership" to match mocked data.
  membership?: number;
  membershipId?: number;
  // Supporting both string and Date type to
  // match mocked data and addition via API.
  start: Date | string;
  end: Date | string;
  state: string;
}
