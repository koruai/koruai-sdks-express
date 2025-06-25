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
    const originalSend = res.send;
    res.send = function (body: any) {
      collectRequest(req, body, res.statusCode, config.apiKey, config.appId);
      return originalSend.call(this, body);
    };

    next();
  };
}
