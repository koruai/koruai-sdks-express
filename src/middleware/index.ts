import { NextFunction, Request, RequestHandler, Response } from "express";
import { collectRequest } from "../helper/collectRequest";
import { AnomalyMiddlewareConfig } from "../interfaces/AnomalyMiddleware";

/**
 * Creates Express middleware for AI-powered security monitoring.
 * @param config - Configuration object for the Anomaly middleware
 * @param config.apiKey - Your API key for authentication with Anomaly AI servers
 * @param config.appId - Your application ID for identifying your app
 * @returns Express middleware function
 */
export function Anomaly(config: AnomalyMiddlewareConfig): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Only override res.send since res.json and other response methods call res.send internally
    const originalSend = res.send.bind(res);
    res.send = async function (this: Response, body: any) {
      res.send = originalSend;

      if (config.blockRealtime) {
        const newlyWrittenRequestData = await collectRequest(
          req,
          body,
          res.statusCode,
          config.apiKey,
          config.appId
        );

        if (
          newlyWrittenRequestData &&
          newlyWrittenRequestData.anomaly_is_anomaly
        )
          return originalSend.call(this, {
            message: "Anomaly detected",
          });
      }

      collectRequest(req, body, res.statusCode, config.apiKey, config.appId);
      return originalSend.call(this, body);
    } as any;

    next();
  };
}
