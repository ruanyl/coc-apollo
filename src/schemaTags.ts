import gql from 'graphql-tag';

export const SCHEMA_TAGS = gql`
  query SchemaTags($id: ID!) {
    service(id: $id) {
      variants {
        name
      }
    }
  }
`;
