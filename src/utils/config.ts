// @ts-nocheck

const environment: "production" | "development" | "local_development" =
  "development";

export const REQUEST_COLLECTION_ENDPOINT =
  environment === "production"
    ? "https://request-colletor-api-973817945996.europe-west1.run.app/collect-request"
    : environment === "development"
    ? "https://request-colletor-api-229153978352.europe-west1.run.app/collect-request"
    : "http://localhost:3001/collect-request";

export const FETCH_POLICIES_ENDPOINT =
  environment === "production"
    ? "https://clickhouse-reader-api-973817945996.europe-west1.run.app/get-policies"
    : environment === "development"
    ? "https://clickhouse-reader-api-229153978352.europe-west1.run.app/get-policies"
    : "http://localhost:3002/get-policies";

export const FETCH_POLICIES_INTERVAL_IN_SECONDS = 60;
