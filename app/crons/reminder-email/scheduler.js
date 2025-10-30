import appInsights from "applicationinsights";
import cron from "node-cron";
import { config } from "../../config/index.js";
import { triggerReminderEmailProcess } from "../../api/applications.js";

const handleReminderEmail = async (logger) => {
  try {
    logger.info("Starting schedule for reminder email");
    await triggerReminderEmailProcess(logger);
    logger.info("Completed schedule for reminder email");
  } catch (err) {
    logger.error({ err }, "Error during scheduled reminder email task");
    appInsights.defaultClient.trackException({ exception: err });
  }
};

export const scheduler = {
  plugin: {
    name: "reminderEmailScheduler",
    register: async (server) => {
      const { enabled, schedule } = config.reminderEmailScheduler;
      server.logger.info({ schedule: config.reminderEmailScheduler }, "registering schedule for reminder email");

      if (!cron.validate(schedule)) {
        server.logger.warn(
          { schedule },
          "Invalid cron schedule syntax – reminder email will not be scheduled",
        );
        return;
      }

      cron.schedule(
        schedule,
        async () => {
          const logger = server.logger.child({});
          await handleReminderEmail(logger);
        },
        {
          scheduled: enabled,
        },
      );
    },
  },
};
