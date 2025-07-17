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
import {
  EndpointMapperInterfaceAtClickhouse,
  ResultFromMatchedUrlToEndpointFunction,
} from "./EndpointMapper";

export class PolicyManager {
  private appId: string;
  private apiKey: string;

  private refreshInterval: ReturnType<typeof setInterval> | null = null;

  private policies: PolicyDataAtClickhouse[] | null = null;
  private endpointMapper: EndpointMapperInterfaceAtClickhouse | null = null;

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
        endpointMapper: EndpointMapperInterfaceAtClickhouse;
      };

      if (!data) {
        console.error("No data received from anomaly servers");
        this.endpointMapper = null;
        return (this.policies = null);
      }

      const policies = data.policies;
      if (!policies) {
        console.error("No policies received from anomaly servers");
        this.endpointMapper = null;
        return (this.policies = null);
      }

      if (!data.endpointMapper) {
        console.error("No endpoint mapper received from anomaly servers");
        this.endpointMapper = null;
        return (this.policies = policies);
      }

      this.endpointMapper = data.endpointMapper;

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

  private getEndpointMappingResultOfRequest(
    endpointMapperData: EndpointMapperInterfaceAtClickhouse,
    requestDataFromSdk: RequestCollectionDataFromSDK
  ) {
    try {
      const matchUrlToEndpointFunction = eval(
        "(" + endpointMapperData.match_url_to_endpoint_function + ")"
      );

      const result = matchUrlToEndpointFunction(
        requestDataFromSdk.url
      ) as ResultFromMatchedUrlToEndpointFunction;

      return result.endpoint;
    } catch (error) {
      console.error("Error while getting endpoint for this request: ", error);
      return false;
    }
  }

  private getPolicyByEndpointAndMethod(endpoint: string, method: string) {
    if (this.policies === null) {
      console.error("Policies are null at the moment.");
      return false;
    }

    const policy = this.policies.find(
      (policy) => policy.url === endpoint && policy.method === method
    );

    if (!policy) {
      console.error(
        "No policy found for the request: ",
        endpoint,
        " and ",
        method
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
    if (!this.endpointMapper) {
      console.error("Endpoint mapper is null at the moment.");
      return null;
    }

    const endpoint = this.getEndpointMappingResultOfRequest(
      this.endpointMapper,
      requestDataFromSDK
    );
    if (!endpoint) {
      console.warn(
        "Endpoint could not be found for the request. Aborting realtime anomaly check."
      );
      console.warn("This request will be checked in our servers later.");
      return null;
    }

    const relatedPolicy = this.getPolicyByEndpointAndMethod(
      endpoint,
      requestDataFromSDK.method
    );
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
