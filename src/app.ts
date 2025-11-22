import express from "express";
import membershipRoutes from "./modern/routes/membership.routes";
import { errorHandler } from "./error-handler.middleware";

// because of the javascript module, we need to use require to import the legacy routes
const legacyMembershipRoutes = require('./legacy/routes/membership.routes')

const app = express();

app.use(express.json());
app.use("/memberships", membershipRoutes);
app.use("/legacy/memberships", legacyMembershipRoutes);
app.use(errorHandler);

export default app;
