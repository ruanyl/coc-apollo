import {
  commands,
  ExtensionContext,
  LanguageClient,
  LanguageClientOptions,
  listManager,
  OutputChannel,
  RevealOutputChannelOn,
  ServerOptions,
  services,
  TransportKind,
  window,
  workspace,
} from 'coc.nvim';
import ApolloVariantList from './lists';
import { loadConfig } from './loadConfig';
import { cachedFieldStats, reloadFieldStats } from './reloadFieldStats';
import { generateDecorations } from './parse';
import { reloadSchema, cachedSchema } from './reloadSchema';
import { reloadSchemaVariants } from './reloadSchemaVariants';

const SupportedFiletype = ['graphql', 'javascript', 'javascriptreact', 'typescript', 'typescriptreact'];

export async function activate(context: ExtensionContext): Promise<void> {
  const apolloConfig = await loadConfig({ configPath: workspace.root });
  const virtualTextSrcId = await workspace.nvim.createNamespace('coc-apollo-graphql');

  if (apolloConfig) {
    await reloadSchema(apolloConfig, 'current');

    context.subscriptions.push(listManager.registerList(new ApolloVariantList(workspace.nvim, apolloConfig)));

    context.subscriptions.push(
      commands.registerCommand('apollo.reload.variants', async () => {
        await reloadSchemaVariants(apolloConfig);
      }),

      commands.registerCommand('apollo.reload.stats', async () => {
        await reloadFieldStats(apolloConfig);
      }),

      workspace.registerAutocmd({
        event: ['BufEnter', 'BufWritePost'],
        request: true,
        callback: async () => {
          if (cachedSchema.schema) {
            const doc = await workspace.document;
            if (!SupportedFiletype.includes(doc.filetype)) {
              return;
            }
            await doc.buffer.request('nvim_buf_clear_namespace', [virtualTextSrcId, 0, -1]);
            if (cachedFieldStats.fieldStats.size === 0) {
              await reloadFieldStats(apolloConfig);
            }
            if (doc.content.trim() !== '') {
              const decorations = generateDecorations(
                doc.content,
                doc.uri,
                cachedSchema.schema,
                cachedFieldStats.fieldStats
              );
              decorations.forEach(async (d) => {
                if (d.document === doc.uri) {
                  await doc.buffer.setVirtualText(virtualTextSrcId, d.range.start.line, [[d.message, 'CocCodeLens']]);
                }
              });
            }
          }
        },
      })
    );
  }
  // const config = workspace.getConfiguration('coc-apollo-graphql');
  const debug = true; // config.get<boolean>('debug');

  const serverModule = context.asAbsolutePath('./lib/languageServer.js');

  const debugOptions = {
    execArgv: ['--nolazy', '--inspect=localhost:6009'],
  };

  const serverOptions: ServerOptions = {
    run: {
      module: serverModule,
      transport: TransportKind.ipc,
    },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: { ...(debug ? debugOptions : {}) },
    },
  };

  const outputChannel: OutputChannel = window.createOutputChannel('GraphQL Language Server');

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: 'file', language: 'graphql' },
      { scheme: 'file', language: 'javascript' },
      { scheme: 'file', language: 'javascriptreact' },
      { scheme: 'file', language: 'typescript' },
      { scheme: 'file', language: 'typescriptreact' },
    ],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher('**/*.{graphql,gql,js,jsx,ts,tsx}'),
    },
    outputChannel,
    outputChannelName: 'GraphQL Language Server',
    revealOutputChannelOn: RevealOutputChannelOn.Never,
  };

  const client = new LanguageClient(
    'coc-apollo-graphql',
    'GraphQL Language Server',
    serverOptions,
    clientOptions,
    debug
  );

  context.subscriptions.push(services.registLanguageClient(client));
}
