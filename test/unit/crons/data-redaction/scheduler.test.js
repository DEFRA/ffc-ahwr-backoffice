import cron from 'node-cron';
import appInsights from 'applicationinsights';
import { scheduler } from '../../../../app/crons/data-redaction/scheduler';
import { config } from '../../../../app/config';
import { redactPiiData } from '../../../../app/api/applications';

jest.mock('node-cron');
jest.mock('applicationinsights');
jest.mock('../../../../app/api/applications');
jest.mock('../../../../app/config', () => ({
  config: {
    dataRedactionScheduler: {
      schedule: '0 0 * * *',
      enabled: true,
    },
  },
}));

describe('scheduler.plugin.register', () => {
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

  it('registers a cron job with valid schedule', async () => {
    await scheduler.plugin.register(mockServer);

    expect(mockLogger.info).toHaveBeenCalledWith(
      {
        schedule: config.dataRedactionScheduler,
      },
      "registering schedule for data redaction"
    );
    expect(cron.schedule).toHaveBeenCalled();
  });

  it('does not schedule if cron schedule is invalid', async () => {
    cron.validate.mockReturnValue(false);

    await scheduler.plugin.register(mockServer);

    expect(mockLogger.warn).toHaveBeenCalledWith(
      { schedule: config.dataRedactionScheduler.schedule },
      "Invalid cron schedule syntax – data redaction will not be scheduled"
    );
    expect(cron.schedule).not.toHaveBeenCalled();
  });

  it('calls redactPiiData and logs success', async () => {
    const scheduledFn = jest.fn();
    cron.schedule.mockImplementation((_, fn) => {
      scheduledFn.mockImplementation(fn);
      return scheduledFn;
    });

    await scheduler.plugin.register(mockServer);
    await scheduledFn();

    expect(redactPiiData).toHaveBeenCalledWith(mockLogger);
    expect(mockLogger.info).toHaveBeenCalledWith("Completed schedule for data redaction");
  });

  it('tracks exception if redactPiiData throws', async () => {
    const error = new Error('Redaction failed');
    redactPiiData.mockRejectedValue(error);

    const scheduledFn = jest.fn();
    cron.schedule.mockImplementation((_, fn) => {
      scheduledFn.mockImplementation(fn);
      return scheduledFn;
    });

    await scheduler.plugin.register(mockServer);
    await scheduledFn();

    expect(mockLogger.error).toHaveBeenCalledWith(
      { err: error },
      "Error during scheduled data redaction task"
    );
    expect(mockTrackException).toHaveBeenCalledWith({ exception: error });
  });
});