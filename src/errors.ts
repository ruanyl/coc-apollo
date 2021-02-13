export class CocApolloGraphqlExtensionError extends Error {
  name = 'CocApolloGraphqlExtensionError';

  constructor(msg?: string) {
    super(msg);
  }
}
