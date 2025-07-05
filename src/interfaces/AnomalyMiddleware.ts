/**
 * Configuration for Anomaly middleware
 */
export interface AnomalyMiddlewareConfig {
  /**
   * Your API key for authentication with Anomaly AI servers
   */
  apiKey: string;
  /**
   * Your application ID for identifying your app
   */
  appId: string;

  /**
   * Whether to check for anomaly in real-time.
   * If true, the middleware will check for anomaly in real-time and block the request if anomaly is detected.
   * If false, the middleware will check for anomaly in our servers and send report to dashboard.
   * Default is false.
   */
  blockRealtime?: boolean;
}
