export type ApolloConfigFormat = ApolloClientConfigFormat & ApolloEngineConfigFormat;

export type ApolloClientConfigFormat = {
  client: {
    service: string | ClientServiceConfig;
  };
};

export type ClientServiceConfig = RemoteServiceConfig | LocalServiceConfig;

export type ApolloEngineConfigFormat = {
  engine?: {
    apiKey: string;
  };
};

export interface RemoteServiceConfig {
  kind: 'RemoteServiceConfig';
  name: string;
  url: string;
  headers?: { [key: string]: string };
  skipSSLValidation?: boolean;
}

export interface LocalServiceConfig {
  kind: 'LocalServiceConfig';
  name: string;
  localSchemaFile: string | string[];
}
