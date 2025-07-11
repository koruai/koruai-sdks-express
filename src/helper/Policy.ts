import {
  PolicyDataAtClickhouse,
  ResultFromCheckRequestForAnomalyFunction,
} from "../interfaces/Policy";
import {
  FETCH_POLICIES_ENDPOINT,
  FETCH_POLICIES_INTERVAL_IN_SECONDS,
} from "../utils/config";

import { ResultFromCheckingFunction } from "../interfaces/Policy";
import { RequestCollectionDataFromSDK } from "../interfaces/Collection";

export class PolicyManager {
  private appId: string;
  private apiKey: string;

  private refreshInterval: NodeJS.Timeout | null = null;

  private policies: PolicyDataAtClickhouse[] | null = null;

  constructor(
    blockRealtime: boolean | undefined,
    appId: string,
    apiKey: string
  ) {
    this.appId = appId;
    this.apiKey = apiKey;

    if (blockRealtime) this.initializePolicyFetch();
  }

  private async fetchPolicies() {
    try {
      const endpoint = `${FETCH_POLICIES_ENDPOINT}?appId=${this.appId}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          x_api_key: this.apiKey,
        },
      });

      if (!response.ok) {
        console.error(
          "Response from anomaly servers is not ok: ",
          await response.text()
        );
        return (this.policies = null);
      }

      const data = (await response.json()) as {
        policies: PolicyDataAtClickhouse[];
      };

      if (!data) {
        console.error("No data received from anomaly servers");
        return (this.policies = null);
      }

      const policies = data.policies;
      if (!policies) {
        console.error("No policies received from anomaly servers");
        return (this.policies = null);
      }

      return (this.policies = policies);
    } catch (error) {
      console.error("Error fetching policies: ", error);
      return (this.policies = null);
    }
  }

  private initializePolicyFetch() {
    console.log("Realtime Anomaly Check Enabled");

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.fetchPolicies();

    this.refreshInterval = setInterval(() => {
      this.fetchPolicies();
    }, FETCH_POLICIES_INTERVAL_IN_SECONDS * 1000);
  }

  public getPolicies() {
    return this.policies;
  }

  private getPolicyByEndpointAndMethod(
    requestDataFromSDK: RequestCollectionDataFromSDK
  ) {
    if (this.policies === null) {
      console.error("Policies are null at the moment.");
      return false;
    }

    // Problem is url from SDK is not base url so it contains query params etc.
    // We need to remove query params and compare the base url
    const baseUrlFromRequest = requestDataFromSDK.url.split("?")[0];

    const policy = this.policies.find(
      (policy) =>
        policy.url === baseUrlFromRequest &&
        policy.method === requestDataFromSDK.method
    );

    if (!policy) {
      console.error(
        "No policy found for the request: ",
        baseUrlFromRequest,
        " and ",
        requestDataFromSDK.method
      );
      return false;
    }

    return policy;
  }

  private getResultFromCheckingFunction(
    policyData: PolicyDataAtClickhouse,
    requestData: RequestCollectionDataFromSDK
  ) {
    try {
      const checkingFunction = eval("(" + policyData.checking_function + ")");

      const result = checkingFunction(
        requestData
      ) as ResultFromCheckingFunction;

      return result;
    } catch (error) {
      console.error("Error in getting result from checking function: ", error);
      return false;
    }
  }

  public checkRequestForAnomaly(
    requestDataFromSDK: RequestCollectionDataFromSDK
  ): ResultFromCheckRequestForAnomalyFunction | null {
    const relatedPolicy = this.getPolicyByEndpointAndMethod(requestDataFromSDK);
    if (!relatedPolicy) {
      console.warn(
        "Related policy could not be found for the request. Aborting realtime anomaly check."
      );
      console.warn("This request will be checked in our servers later.");
      return null;
    }

    const result = this.getResultFromCheckingFunction(
      relatedPolicy,
      requestDataFromSDK
    );

    if (!result) {
      console.warn(
        "Result from checking function is false. Aborting realtime anomaly check."
      );
      console.warn("This request will be checked in our servers later.");
      return null;
    }

    return { ...result, detected_by_policy_id: relatedPolicy.id };
  }
}
