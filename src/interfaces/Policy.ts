export interface PolicyDataAtClickhouse {
  app_id: string;
  checking_function: string;
  description: string;
  id: string;
  method: string;
  title: string;
  timestamp: string;
  user_uuid: string;
  url: string;
}

export interface PolicyDataFromAi {
  checking_function: string;
  description: string;
  method: string;
  title: string;
  url: string;
}

/**
 * This is thr result came from function created by AI.
 */
export interface ResultFromCheckingFunction {
  /**
   * True means the request is not passed policy successfully meaning it is an anomaly.
   * False means the request is passed policy successfully meaning it is not an anomaly.
   */
  is_anomaly: boolean;
  /**
   * The description of the anomaly or no anomaly.
   */
  description: string;
}

/**
 * This is the result from a function that uses function made up by AI.
 */
export interface ResultFromCheckRequestForAnomalyFunction
  extends ResultFromCheckingFunction {
  detected_by_policy_id: string;
}
