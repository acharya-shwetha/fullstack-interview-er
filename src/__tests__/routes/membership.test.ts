import request from "supertest";
import app from "../../app";
import { MembershipPeriod } from "../../modern/routes/models";

describe("POST /memberships", () => {
  let default_test_data = {
    name: "Gold Plan",
    recurringPrice: 100,
    validFrom: "2025-05-25",
    paymentMethod: "cash",
    billingInterval: "monthly",
    billingPeriods: 6,
  };
  it.each([
    ["missingMandatoryFields", { ...default_test_data, name: "" }],
    ["missingMandatoryFields", { ...default_test_data, recurringPrice: 0 }],
    ["negativeRecurringPrice", { ...default_test_data, recurringPrice: -1 }],
    ["cashPriceBelow100", { ...default_test_data, recurringPrice: 101 }],
    [
      "billingPeriodsMoreThan12Months",
      { ...default_test_data, billingPeriods: 13 },
    ],
    [
      "billingPeriodsLessThan6Months",
      { ...default_test_data, billingPeriods: 5 },
    ],
    [
      "billingPeriodsMoreThan10Years",
      { ...default_test_data, billingPeriods: 11, billingInterval: "yearly" },
    ],
    [
      "billingPeriodsLessThan3Years",
      { ...default_test_data, billingPeriods: 8, billingInterval: "yearly" },
    ],
    [
      "invalidBillingPeriods",
      { ...default_test_data, billingInterval: "weekly" },
    ],
  ])("400 Error %s", async (expectedErrMessage, reqBody) => {
    const response = await request(app).post("/memberships").send(reqBody);
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe(expectedErrMessage);
  });

  it("Success", async () => {
    const reqBody = default_test_data;
    const response = await request(app).post("/memberships").send(reqBody);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("membership");
    expect(response.body).toHaveProperty("membershipPeriods");
    expect(response.body.membershipPeriods).toHaveLength(
      reqBody.billingPeriods
    );
  });

  it.each([
    ["active", default_test_data],
    ["expired", { ...default_test_data, validFrom: "2024-05-25" }],
    ["pending", { ...default_test_data, validFrom: "2026-05-25" }],
  ])("Success state %s", async (expectedState, reqBody) => {
    const response = await request(app).post("/memberships").send(reqBody);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("membership");
    expect(response.body.membership).toHaveProperty("state", expectedState);
  });

  it("Success - legacy compare", async () => {
    const reqBody = default_test_data;
    const response = await request(app).post("/memberships").send(reqBody);
    const legacyResponse = await request(app)
      .post("/legacy/memberships")
      .send(reqBody);
    expect(response.statusCode).toBe(legacyResponse.statusCode);
    // Check for membership data match with legacy API
    let modernMembershipData = response.body.membership;
    delete modernMembershipData["id"];
    delete modernMembershipData["uuid"];
    let legacyMembershipData = legacyResponse.body.membership;
    delete legacyMembershipData["id"];
    delete legacyMembershipData["uuid"];
    expect(modernMembershipData).toStrictEqual(legacyMembershipData);
  });
});

describe("GET /memberships", () => {
  it("Success", async () => {
    let expectedDataItem = {
      membership: {
        id: 1,
        uuid: "123e4567-e89b-12d3-a456-426614174000",
        name: "Platinum Plan",
        userId: 2000,
        recurringPrice: 150,
        validFrom: "2023-01-01",
        validUntil: "2023-12-31",
        state: "active",
        assignedBy: "Admin",
        paymentMethod: "credit card",
        billingInterval: "monthly",
        billingPeriods: 12,
      },
      periods: [],
    };
    const response = await request(app).get("/memberships");
    expect(response.statusCode).toBe(200);
    expect(response.body).toContainEqual(expectedDataItem);
  });

  it("Success - legacy compare", async () => {
    const response = await request(app).get("/memberships");
    const legacyResponse = await request(app).get("/legacy/memberships");
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual(legacyResponse.body);
  });
});
