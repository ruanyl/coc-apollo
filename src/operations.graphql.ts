import gql from 'graphql-tag';

export const FIELD_STATS = gql`
  query FieldStats($id: ID!) {
    service(id: $id) {
      stats(from: "-86400", to: "-0") {
        fieldStats {
          groupBy {
            field
          }
          metrics {
            fieldHistogram {
              durationMs(percentile: 0.95)
            }
          }
        }
      }
    }
  }
`;

export const SCHEMA_TAGS = gql`
  query SchemaTags($id: ID!) {
    service(id: $id) {
      variants {
        name
      }
    }
  }
`;

export const SCHEMA_DOCUMENT = gql`
  query schemaDocument($id: ID!, $tag: String!) {
    service(id: $id) {
      schema(tag: $tag) {
        document
      }
    }
  }
`;
