/**
 * Error logger for Stripe webhook events
 * This can be extended to integrate with error monitoring services like Sentry
 */

interface LogEvent {
  type: string;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
  error?: Error;
}

class WebhookErrorLogger {
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Log a webhook event
   */
  public log(event: Omit<LogEvent, 'timestamp'>) {
    const logEvent: LogEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    // In production, you might want to send this to an error monitoring service
    if (this.isProduction) {
      // For now, just log to console in a structured format
      console.log(JSON.stringify(logEvent));
    } else {
      // In development, use more verbose logging
      const prefix = `[Stripe ${event.type}]`;

      if (event.type === 'error') {
        console.error(
          prefix,
          event.message,
          event.data || '',
          event.error || ''
        );
      } else {
        console.log(prefix, event.message, event.data || '');
      }
    }
  }

  /**
   * Log an error event
   */
  public error(message: string, error?: Error, data?: Record<string, unknown>) {
    this.log({
      type: 'error',
      message,
      error,
      data,
    });
  }

  /**
   * Log an info event
   */
  public info(message: string, data?: Record<string, unknown>) {
    this.log({
      type: 'info',
      message,
      data,
    });
  }

  /**
   * Log a warning event
   */
  public warn(message: string, data?: Record<string, unknown>) {
    this.log({
      type: 'warning',
      message,
      data,
    });
  }
}

// Export a singleton instance
export const webhookLogger = new WebhookErrorLogger();
