import express, { Request, Response } from "express";
import membershipsJson from "../../data/memberships.json";
import membershipPeriodsJson from "../../data/membership-periods.json";
import {
  Membership,
  AddMembershipResponse,
  MembershipPeriod,
  GetMembershipResponse,
} from "./models";
import { MembershipPeriodSchema, MembershipSchema } from "./schema";
import {
  validateRequestBody,
  computeMembershipValidUntil,
  computeMembershipPeriodValidUntil,
  computeState,
} from "./helper";
import { TypedRequestBody, MembershipInput } from "./dto";
const { v4: uuidv4 } = require("uuid");

let memberships: Array<MembershipSchema> = membershipsJson;
let membershipPeriods: Array<MembershipPeriodSchema> = membershipPeriodsJson;

const router = express.Router();

function getMembership(membershipSchemaData: MembershipSchema): Membership {
  let {
    id,
    uuid,
    name,
    state,
    validFrom,
    validUntil,
    user,
    paymentMethod,
    recurringPrice,
    billingPeriods,
    billingInterval,
  } = membershipSchemaData;
  let membershipResponse: Membership = {
    id,
    uuid,
    name,
    state,
    validFrom: new Date(validFrom),
    validUntil: new Date(validUntil),
    user,
    paymentMethod,
    recurringPrice,
    billingPeriods,
    billingInterval,
  };
  return membershipResponse;
}

function addMembership(
  newMembershipData: MembershipInput,
  userId: number
): Membership {
  let {
    validFrom: validFromString,
    name,
    recurringPrice,
    paymentMethod,
    billingInterval,
    billingPeriods,
  } = newMembershipData;

  const validFrom: Date = validFromString
    ? new Date(validFromString)
    : new Date();
  const validUntil: Date = computeMembershipValidUntil(
    validFrom,
    billingInterval,
    billingPeriods
  );
  const state: string = computeState(validFrom, validUntil);

  const id: number = memberships.length + 1;
  const uuid: string = uuidv4();

  const newMembership: MembershipSchema = {
    id,
    uuid,
    name,
    state,
    validFrom,
    validUntil,
    user: userId,
    paymentMethod: paymentMethod,
    recurringPrice: recurringPrice,
    billingPeriods: billingPeriods,
    billingInterval: billingInterval,
  };
  memberships.push(newMembership);

  let membershipData: Membership = getMembership(newMembership);

  // This is required to retain DST offset.
  return { ...membershipData, validUntil };
}

function getMembershipPeriod(
  membershipPeriod: MembershipPeriodSchema
): MembershipPeriod {
  let { id, uuid, membership, start, end, state } = membershipPeriod;
  return {
    id,
    uuid,
    membershipId: membership,
    start: new Date(start),
    end: new Date(end),
    state,
  };
}

function addMembershipPeriods(
  membershipData: Membership
): Array<MembershipPeriod> {
  const membershipPeriodsResponse: Array<MembershipPeriod> = [];

  // In legacy code during add of membership periods
  // same variable "membershipPeriods" is used to calculate membership
  // periods and data imported from json file which is reset to [].
  // MembershipPeriods never get added to list imported from JSON data.
  // Adding below line to match the legacy code behaviour.
  const membershipPeriods = [];
  let {
    validFrom: membershipValidFrom,
    billingInterval,
    billingPeriods,
  } = membershipData;
  let periodStart = membershipValidFrom;
  for (let i = 0; i < billingPeriods; i++) {
    const validFrom: Date = periodStart;
    const validUntil: Date = computeMembershipPeriodValidUntil(
      validFrom,
      billingInterval
    );
    const period: MembershipPeriodSchema = {
      id: i + 1,
      uuid: uuidv4(),
      membershipId: membershipData.id,
      start: validFrom,
      end: validUntil,
      state: "planned",
    };
    membershipPeriods.push(period);
    let membershipPeriod: MembershipPeriod = getMembershipPeriod(period);
    // This is required to retain DST offset.
    membershipPeriodsResponse.push({ ...membershipPeriod, end: validUntil });
    periodStart = validUntil;
  }
  return membershipPeriodsResponse;
}

router.post(
  "/",
  (
    req: TypedRequestBody<MembershipInput>,
    res: Response<AddMembershipResponse | { message: string }>
  ) => {
    const userId: number = 2000;
    let { body } = req;

    let errMessage = validateRequestBody(body);
    if (errMessage) {
      return res.status(400).json({ message: errMessage });
    }

    let membership: Membership = addMembership(body, userId);
    let membershipPeriods: Array<MembershipPeriod> =
      addMembershipPeriods(membership);

    res.status(201).json({ membership, membershipPeriods });
  }
);

router.get("/", (req: Request, res: Response<Array<GetMembershipResponse>>) => {
  const rows: Array<GetMembershipResponse> = [];
  for (const membership of memberships) {
    // Since membership periods for newly added memberships
    // are never pushed to membershipPeriods list imported from json file.
    // periods always returns empty array.
    // Retaining it to match legacy code behavior.
    let periods: Array<MembershipPeriodSchema> = membershipPeriods.filter(
      (p: MembershipPeriodSchema) => p.membershipId === membership.id
    );
    rows.push({ membership, periods });
  }
  res.status(200).json(rows);
});

export default router;
