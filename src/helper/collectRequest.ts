import "dotenv/config";
import { Request } from "express";
import { RequestDataFromSDKs } from "../interfaces/Collection";
import { REQUEST_COLLECTION_ENDPOINT } from "../utils/config";

function createSDKRequestData(
  req: Request,
  obj: any,
  statusCode: number
): RequestDataFromSDKs {
  // Ensure body is properly stringified without double-stringification
  let bodyString: string;
  if (typeof obj === "string") {
    bodyString = obj;
  } else {
    bodyString = JSON.stringify(obj);
  }

  // Ensure headers are properly stringified without double-stringification (we don't need this but just in case)
  let headersString: string;
  if (typeof req.headers === "string") {
    headersString = req.headers;
  } else {
    headersString = JSON.stringify(req.headers);
  }

  const newSDKRequestData: RequestDataFromSDKs = {
    body: bodyString,
    headers: headersString,
    ipAddress: req.ip || "",
    method: req.method,
    statusCode: statusCode || 0,
    timestamp: Math.floor(Date.now() / 1000),
    url: req.url,
  };

  return newSDKRequestData;
}

async function sendRequestToAnomalyServers(
  requestData: RequestDataFromSDKs,
  apiKey: string,
  appId: string
) {
  if (!REQUEST_COLLECTION_ENDPOINT) {
    console.error("REQUEST_COLLECTION_ENDPOINT is not set");
    return false;
  }

  try {
    const response = await fetch(REQUEST_COLLECTION_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "x-app-id": appId,
      },
      body: JSON.stringify({
        requestDataFromSDK: requestData,
      }),
    });

    if (!response.ok) {
      console.error(
        "Response from request collection endpoint is not okay: ",
        await response.text()
      );

      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "Error sending request to request collection endpoint: ",
      error
    );
    return false;
  }
}

/**
 * This function handles creating request collection object and sending it to AnomalyAI servers.
 * @param req
 * @param obj
 */
export async function collectRequest(
  req: Request,
  obj: any,
  statusCode: number,
  apiKey: string,
  appId: string
) {
  const newSDKRequestData = createSDKRequestData(req, obj, statusCode);
  await sendRequestToAnomalyServers(newSDKRequestData, apiKey, appId);
}
