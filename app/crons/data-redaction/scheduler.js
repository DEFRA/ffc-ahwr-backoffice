import appInsights from "applicationinsights";
import cron from "node-cron";
import { config } from "../../config/index.js";
import { redactPiiData } from "../../api/applications.js";

const handleDataRedaction = async (logger) => {
  try {
    logger.info("Starting schedule for data redaction");
    await redactPiiData(logger)
    logger.info('Completed schedule for data redaction')
  } catch (err) {
    logger.error({ err }, "Error during scheduled data redaction task");
    appInsights.defaultClient.trackException({ exception: err });
  }
}

export const scheduler = {
  plugin: {
    name: "dataRedactionScheduler",
    register: async (server) => {
      server.logger.info(
        {
          schedule: config.dataRedactionScheduler,
        },
        "registering schedule for data redaction",
      );

      if (!cron.validate(config.dataRedactionScheduler.schedule)) {
        server.logger.warn(
          { schedule: config.dataRedactionScheduler.schedule },
          "Invalid cron schedule syntax – data redaction will not be scheduled"
        );
        return;
      }

      cron.schedule(
        config.dataRedactionScheduler.schedule,
        async () => {
          const logger = server.logger.child({});
          await handleDataRedaction(logger)
        },
        {
          scheduled: config.dataRedactionScheduler.enabled,
      },
      );
    },
  },
};
