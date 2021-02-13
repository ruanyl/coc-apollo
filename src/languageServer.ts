import { startServer } from 'graphql-language-service-server';

function startLanguageServer() {
  startServer({
    method: 'node',
  })
    .then(() => {})
    .catch((error) => console.log(error));
}

startLanguageServer();
