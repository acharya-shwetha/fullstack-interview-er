import { MembershipInput } from "./dto";
import { BillingEnum } from "./models";

function validateBillingData(
  billingInterval: string,
  billingPeriods: number
): string {
  let errMessage: string = "";
  switch (billingInterval) {
    case "monthly":
      if (billingPeriods > 12) {
        errMessage = "billingPeriodsMoreThan12Months";
      }
      if (billingPeriods < 6) {
        errMessage = "billingPeriodsLessThan6Months";
      }
      break;
    case "yearly":
      if (billingPeriods > 3 && billingPeriods <= 10) {
        errMessage = "billingPeriodsLessThan3Years";
      } else if (billingPeriods > 10) {
        errMessage = "billingPeriodsMoreThan10Years";
      }
      break;
    default:
      errMessage = "invalidBillingPeriods";
      break;
  }
  return errMessage;
}

export function validateRequestBody(membershipData: MembershipInput): string {
  let { name, recurringPrice, paymentMethod, billingInterval, billingPeriods } =
    membershipData;
  let errMessage: string = "";
  if (!name || !recurringPrice) {
    return "missingMandatoryFields";
  }

  if (recurringPrice < 0) {
    return "negativeRecurringPrice";
  }

  if (recurringPrice > 100 && paymentMethod === "cash") {
    return "cashPriceBelow100";
  }

  errMessage = validateBillingData(billingInterval, billingPeriods);

  return errMessage;
}

export function computeMembershipValidUntil(
  validFrom: Date,
  billingInterval: string,
  billingPeriods: number
): Date {
  let validUntil: Date = new Date(validFrom);
  switch (billingInterval) {
    case "monthly":
      validUntil.setMonth(validFrom.getMonth() + billingPeriods);
      break;
    case "yearly":
      validUntil.setMonth(
        validFrom.getMonth() + billingPeriods * BillingEnum.yearly
      );
      break;
    case "weekly":
      validUntil.setDate(
        validFrom.getDate() + billingPeriods * BillingEnum.weekly
      );
      break;
  }
  return validUntil;
}

export function computeState(validFrom: Date, validUntil: Date): string {
  let state = "active";
  if (validFrom > new Date()) {
    state = "pending";
  }
  if (validUntil < new Date()) {
    state = "expired";
  }
  return state;
}

export function computeMembershipPeriodValidUntil(
  validFrom: Date,
  billingInterval: string
): Date {
  let validUntil: Date = new Date(validFrom);
  switch (billingInterval) {
    case "monthly":
      validUntil.setMonth(validFrom.getMonth() + BillingEnum.monthly);
      break;
    case "yearly":
      validUntil.setMonth(validFrom.getMonth() + BillingEnum.yearly);
      break;
    case "weekly":
      validUntil.setDate(validFrom.getDate() + BillingEnum.weekly);
      break;
  }
  return validUntil;
}
