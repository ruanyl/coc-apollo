export const DefaultConfigBase = {
  includes: ['src/**/*.{ts,tsx,js,jsx,graphql,gql}'],
  excludes: ['**/node_modules', '**/__tests__'],
};

export const DefaultEngineStatsWindow = {
  to: -0,
  from: -86400, // one day
};

export const DefaultClientConfig = {
  ...DefaultConfigBase,
  tagName: 'gql',
  clientOnlyDirectives: ['connection', 'type'],
  clientSchemaDirectives: ['client', 'rest'],
  addTypename: true,
  statsWindow: DefaultEngineStatsWindow,
};

export const DefaultServiceConfig = {
  ...DefaultConfigBase,
  endpoint: {
    url: 'http://localhost:4000/graphql',
  },
};

export const ApolloGraphQLEndpoint = 'https://graphql.api.apollographql.com/api/graphql';
