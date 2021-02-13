import gql from 'graphql-tag';

export const SCHEMA_DOCUMENT = gql`
  query schemaDocument($id: ID!, $tag: String!) {
    service(id: $id) {
      schema(tag: $tag) {
        document
      }
    }
  }
`;
