const environment: "production" | "development" = "production";

export const REQUEST_COLLECTION_ENDPOINT =
  // @ts-ignore
  environment === "production"
    ? "https://anomaly-request-collector-api-233311529656.europe-west1.run.app/collect-request"
    : "http://localhost:3001/collect-request";

export const FETCH_POLICIES_ENDPOINT =
  // @ts-ignore
  environment === "production"
    ? "https://anomaly-read-clickhouse-api-233311529656.europe-west1.run.app/get-policies"
    : "http://localhost:3002/get-policies";

export const FETCH_POLICIES_INTERVAL_IN_SECONDS = 60;
