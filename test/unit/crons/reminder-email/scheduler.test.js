import cron from "node-cron";
import appInsights from "applicationinsights";
import { scheduler } from "../../../../app/crons/reminder-email/scheduler";
import { config } from "../../../../app/config";
import { triggerReminderEmailProcess } from "../../../../app/api/applications";

jest.mock("node-cron");
jest.mock("applicationinsights");
jest.mock("../../../../app/api/applications");
jest.mock("../../../../app/config", () => ({
  config: {
    reminderEmailScheduler: {
      enabled: true,
      schedule: "0 0 * * *",
    },
  },
}));

describe("scheduler.plugin.register", () => {
  const mockTrackException = jest.fn();
  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    child: jest.fn().mockReturnThis(),
  };
  const mockServer = { logger: mockLogger };

  beforeEach(() => {
    jest.clearAllMocks();
    appInsights.defaultClient = { trackException: mockTrackException };
    cron.validate.mockReturnValue(true);
  });

  it("registers a cron job with valid schedule", async () => {
    await scheduler.plugin.register(mockServer);

    expect(mockLogger.info).toHaveBeenCalledWith(
      {
        schedule: config.reminderEmailScheduler,
      },
      "registering schedule for reminder email",
    );
    expect(cron.schedule).toHaveBeenCalled();
  });

  it("does not schedule if cron schedule is invalid", async () => {
    cron.validate.mockReturnValue(false);

    await scheduler.plugin.register(mockServer);

    expect(mockLogger.warn).toHaveBeenCalledWith(
      { schedule: config.reminderEmailScheduler.schedule },
      "Invalid cron schedule syntax – reminder email will not be scheduled",
    );
    expect(cron.schedule).not.toHaveBeenCalled();
  });

  it("calls triggerReminderEmailProcess and logs success", async () => {
    const scheduledFn = jest.fn();
    cron.schedule.mockImplementation((_, fn) => {
      scheduledFn.mockImplementation(fn);
      return scheduledFn;
    });

    await scheduler.plugin.register(mockServer);
    await scheduledFn();

    expect(triggerReminderEmailProcess).toHaveBeenCalledWith(mockLogger);
    expect(mockLogger.info).toHaveBeenCalledWith("Completed schedule for reminder email");
  });

  it("tracks exception if triggerReminderEmailProcess throws", async () => {
    const error = new Error("Reminder email failed");
    triggerReminderEmailProcess.mockRejectedValue(error);

    const scheduledFn = jest.fn();
    cron.schedule.mockImplementation((_, fn) => {
      scheduledFn.mockImplementation(fn);
      return scheduledFn;
    });

    await scheduler.plugin.register(mockServer);
    await scheduledFn();

    expect(mockLogger.error).toHaveBeenCalledWith(
      { err: error },
      "Error during scheduled reminder email task",
    );
    expect(mockTrackException).toHaveBeenCalledWith({ exception: error });
  });
});
