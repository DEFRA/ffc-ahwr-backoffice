import { accessibilityRoute } from "../routes/accessibility.js";
import { accountRoute } from "../routes/account.js";
import { agreementRoutes } from "../routes/agreement.js";
import { agreementsRoutes } from "../routes/agreements.js";
import { approveApplicationClaimRoute } from "../routes/approve-application-claim.js";
import { assetsRoute } from "../routes/assets.js";
import { authenticateRoute } from "../routes/authenticate.js";
import { claimsDataRoutes } from "../routes/claims-data.js";
import { claimsRoutes } from "../routes/claims.js";
import { devAuthRoute } from "../routes/dev-auth.js";
import { flagsRoutes } from "../routes/flags.js";
import { healthyRoute } from "../routes/healthy.js";
import { healthzRoute } from "../routes/healthz.js";
import { homeRoute } from "../routes/home.js";
import { loginRoute } from "../routes/login.js";
import { logOutRoute } from "../routes/logout.js";
import { moveToInCheckRoute } from "../routes/move-to-in-check.js";
import { privacyPolicyRoute } from "../routes/privacy-policy.js";
import { recommendToPayRoute } from "../routes/recommend-to-pay.js";
import { recommendToRejectRoute } from "../routes/recommend-to-reject.js";
import { rejectApplicationClaimRoute } from "../routes/reject-application-claim.js";
import { updateStatusRoute } from "../routes/update-status.js";
import { viewAgreementRoute } from "../routes/view-agreement.js";
import { viewClaimRoute } from "../routes/view-claim.js";
import { withdrawAgreementRoute } from "../routes/withdraw-agreement.js";

const routes = [
  accessibilityRoute,
  accountRoute,
  ...agreementRoutes,
  ...agreementsRoutes,
  approveApplicationClaimRoute,
  assetsRoute,
  authenticateRoute,
  ...claimsDataRoutes,
  ...claimsRoutes,
  devAuthRoute,
  ...flagsRoutes,
  healthyRoute,
  healthzRoute,
  homeRoute,
  loginRoute,
  logOutRoute,
  moveToInCheckRoute,
  privacyPolicyRoute,
  recommendToPayRoute,
  recommendToRejectRoute,
  rejectApplicationClaimRoute,
  updateStatusRoute,
  viewAgreementRoute,
  viewClaimRoute,
  withdrawAgreementRoute,
];

export const routerPlugin = {
  plugin: {
    name: "router",
    register: (server, _) => {
      server.route(routes);
    },
  },
};
