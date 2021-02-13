import { fetch } from 'coc.nvim';
import { print } from 'graphql';
import { ApolloConfigFormat } from './apollo';
import { FIELD_STATS } from './fieldStats';

export type FieldStats = Map<string, Map<string, number | null>>;

export const cachedFieldStats: { fieldStats: FieldStats } = {
  fieldStats: new Map(),
};

export async function loadFieldStats(apolloConfig: ApolloConfigFormat) {
  // Load schema stats
  const res = await fetch('https://graphql.api.apollographql.com/api/graphql', {
    method: 'POST',
    headers: {
      'x-api-key': apolloConfig?.engine?.apiKey,
    },
    data: {
      operationName: 'FieldStats',
      query: print(FIELD_STATS),
      variables: { id: apolloConfig?.client.service },
    },
  });

  (res as any).data.service.stats.fieldStats.forEach((fieldStat) => {
    // Parse field "ParentType.fieldName:FieldType" into ["ParentType", "fieldName", "FieldType"]
    const [parentType = null, fieldName = null] = fieldStat.groupBy.field ? fieldStat.groupBy.field.split(/\.|:/) : [];

    if (!parentType || !fieldName) {
      return;
    }
    const fieldsMap =
      cachedFieldStats.fieldStats.get(parentType) ||
      cachedFieldStats.fieldStats.set(parentType, new Map()).get(parentType)!;

    fieldsMap.set(fieldName, fieldStat.metrics.fieldHistogram.durationMs);
  });

  return cachedFieldStats.fieldStats;
}
