export type ApolloConfigFormat = ApolloClientConfigFormat & {
  engine: {
    apiKey: string;
  };
};

export type ApolloClientConfigFormat = {
  client: {
    service: string;
  };
};
