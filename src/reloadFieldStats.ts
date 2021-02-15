import { fetch, window } from 'coc.nvim';
import { print } from 'graphql';
import { ApolloConfigFormat } from './apollo';
import { ApolloGraphQLEndpoint } from './config';
import { FIELD_STATS } from './operations.graphql';
import { getServiceIDFromConfig } from './utils';

export type FieldStats = Map<string, Map<string, number | null>>;

export const cachedFieldStats: { fieldStats: FieldStats } = {
  fieldStats: new Map(),
};

export async function reloadFieldStats(apolloConfig: ApolloConfigFormat) {
  // Load schema stats
  if (typeof apolloConfig.client.service === 'string') {
    const serviceID = getServiceIDFromConfig(apolloConfig.client.service);
    window.showMessage('Field stats loading...');
    const { data, errors } = (await fetch(ApolloGraphQLEndpoint, {
      method: 'POST',
      headers: {
        'x-api-key': apolloConfig?.engine?.apiKey,
      },
      data: {
        operationName: 'FieldStats',
        query: print(FIELD_STATS),
        variables: { id: serviceID },
      },
    })) as any;

    if (!errors) {
      data.service.stats.fieldStats.forEach((fieldStat) => {
        // Parse field "ParentType.fieldName:FieldType" into ["ParentType", "fieldName", "FieldType"]
        const [parentType = null, fieldName = null] = fieldStat.groupBy.field
          ? fieldStat.groupBy.field.split(/\.|:/)
          : [];

        if (!parentType || !fieldName) {
          return;
        }
        const fieldsMap =
          cachedFieldStats.fieldStats.get(parentType) ||
          cachedFieldStats.fieldStats.set(parentType, new Map()).get(parentType)!;

        fieldsMap.set(fieldName, fieldStat.metrics.fieldHistogram.durationMs);
        window.showMessage('Field stats loaded');
      });
    } else {
      console.error(errors);
    }
  }

  return cachedFieldStats.fieldStats;
}
