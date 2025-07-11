export interface RequestInterfaceAtClickhouse {
  app_id: string;
  headers: string;
  id: string;
  ip_address: string;
  method: string;
  response_body: string;
  status_code: number;
  timestamp: string;
  user_uuid: string;
  url: string;
  anomaly_is_anomaly: number;
  anomaly_description: string;
  detected_by_policy_id: string;
  duration_ms: number;
  blocked: number;
}
