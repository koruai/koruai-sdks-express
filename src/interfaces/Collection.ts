import { ResultFromCheckingFunction } from "./Policy";

export interface RequestCollectionDataFromSDK {
  timestamp: number;
  url: string;
  method: string;
  headers: string;
  body: string;
  ipAddress: string;
  statusCode: number;
  duration_ms: number;
  anomaly: null | ResultFromCheckingFunction;
  detected_by_policy_id: string;
  blocked: number;
}
