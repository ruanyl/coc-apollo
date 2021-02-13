import { fetch, window, workspace } from 'coc.nvim';
import fs from 'fs';
import { print } from 'graphql';
import { ApolloConfigFormat } from './apollo';
import { SCHEMA_DOCUMENT } from './schemaDocument';

export const apolloClientSchema = `#graphql
"""
Direct the client to resolve this field locally, either from the cache or local resolvers.
"""
directive @client(
  """
  When true, the client will never use the cache for this value. See
  https://www.apollographql.com/docs/react/essentials/local-state/#forcing-resolvers-with-clientalways-true
  """
  always: Boolean
) on FIELD | FRAGMENT_DEFINITION | INLINE_FRAGMENT
"""
Export this locally resolved field as a variable to be used in the remainder of this query. See
https://www.apollographql.com/docs/react/essentials/local-state/#using-client-fields-as-variables
"""
directive @export(
  """
  The variable name to export this field as.
  """
  as: String!
) on FIELD
"""
Specify a custom store key for this result. See
https://www.apollographql.com/docs/react/advanced/caching/#the-connection-directive
"""
directive @connection(
  """
  Specify the store key.
  """
  key: String!
  """
  An array of query argument names to include in the generated custom store key.
  """
  filter: [String!]
) on FIELD
`;

export async function reloadSchema(apolloConfig: ApolloConfigFormat, variant: string) {
  try {
    // Load schema Introspection, variants & stats
    window.showMessage(`Loading schema of: ${variant}...`);
    const res = await fetch('https://graphql.api.apollographql.com/api/graphql', {
      method: 'POST',
      headers: {
        'x-api-key': apolloConfig?.engine?.apiKey,
      },
      data: {
        operationName: 'schemaDocument',
        query: print(SCHEMA_DOCUMENT),
        variables: { id: apolloConfig?.client.service, tag: variant },
      },
    });

    // Write schema Introspection
    fs.writeFileSync(
      `${workspace.root}/schema.graphql`,
      (res as any).data.service.schema.document + '\n' + apolloClientSchema
    );
    window.showMessage(`Schema(${variant}) loaded: ${workspace.root}/schema.graphql`);
  } catch (e) {
    window.showMessage(`${e}`);
  }
}
