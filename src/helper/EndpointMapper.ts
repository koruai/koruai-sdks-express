export interface EndpointMappingResponseFromAi {
  matchUrlToEndpointFunction: string;
}

export interface EndpointMapperInterfaceAtClickhouse {
  app_id: string;
  match_url_to_endpoint_function: string;
  id: string;
  timestamp: string;
  user_uuid: string;
}

export interface ResultFromMatchedUrlToEndpointFunction {
  endpoint: string;
}
