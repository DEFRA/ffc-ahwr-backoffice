import appInsights from "applicationinsights";
import cron from "node-cron";
import { config } from "../../config/index.js";
import { processOnHoldApplications, processOnHoldClaims } from "./process.js";
import { isTodayHoliday } from "../../api/is-today-holiday.js";

export const scheduler = {
  plugin: {
    name: "onHoldAppScheduler",
    register: async (server) => {
      server.logger.info(
        {
          schedule: config.onHoldAppScheduler,
        },
        "registering schedule for processing on hold applications and claims",
      );

      cron.schedule(
        config.onHoldAppScheduler.schedule,
        async () => {
          const logger = server.logger.child({});
          try {
            const isHoliday = await isTodayHoliday();
            logger.setBindings({ isHoliday });
            if (!isHoliday) {
              await processOnHoldApplications(logger);
              await processOnHoldClaims(logger);
            }

            const { failedApplicationRefs, failedClaimRefs } = logger.bindings();
            if (failedApplicationRefs.length > 0 || failedClaimRefs.length > 0) {
              throw new Error("failed updates");
            }

            logger.info("processing on hold applications and claims");
          } catch (err) {
            logger.error({ err }, "processing on hold applications and claims");
            appInsights.defaultClient.trackException({ exception: err });
          }
        },
        {
          scheduled: config.onHoldAppScheduler.enabled,
        },
      );
    },
  },
};
