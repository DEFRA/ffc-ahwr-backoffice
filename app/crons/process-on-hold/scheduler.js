import appInsights from "applicationinsights";
import cron from "node-cron";
import { config } from "../../config/index.js";
import { processOnHoldClaims } from "./process.js";
import { isTodayHoliday } from "../../api/is-today-holiday.js";

export const scheduler = {
  plugin: {
    name: "onHoldAppScheduler",
    register: async (server) => {
      server.logger.info(
        {
          schedule: config.onHoldAppScheduler,
        },
        "registering schedule for processing on hold claims",
      );

      cron.schedule(
        config.onHoldAppScheduler.schedule,
        async () => {
          const logger = server.logger.child({});
          try {
            const isHoliday = await isTodayHoliday();
            logger.setBindings({ isHoliday });
            if (!isHoliday) {
              await processOnHoldClaims(logger);
            }

            const { failedClaimRefs } = logger.bindings();
            if (failedClaimRefs.length > 0) {
              logAndTrackError(logger, new Error(`Failed updates`));
            } else {
              logger.info("processing on hold claims complete");
            }
          } catch (err) {
            logAndTrackError(logger, err);
          }
        },
        {
          scheduled: config.onHoldAppScheduler.enabled,
        },
      );
    },
  },
};

const logAndTrackError = (logger, err) => {
  logger.error({ err }, "processing on hold claims");
  appInsights.defaultClient.trackException({ exception: err });
};
