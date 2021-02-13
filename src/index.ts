import {
  commands,
  CompleteResult,
  ExtensionContext,
  LanguageClient,
  LanguageClientOptions,
  listManager,
  OutputChannel,
  RevealOutputChannelOn,
  ServerOptions,
  services,
  sources,
  TransportKind,
  window,
  workspace,
} from 'coc.nvim';
import ApolloVariantList from './lists';
import { loadConfig } from './loadConfig';
import { loadFieldStats } from './loadFieldStats';
import { generateDecorations } from './parse';
import { reloadSchema, loadedSchema } from './reloadSchema';

export async function activate(context: ExtensionContext): Promise<void> {
  const apolloConfig = await loadConfig({ configPath: workspace.root });
  const virtualTextSrcId = await workspace.nvim.createNamespace('coc-apollo-graphql');

  if (apolloConfig) {
    await reloadSchema(apolloConfig, 'current');
    const fieldStats = await loadFieldStats(apolloConfig);

    context.subscriptions.push(listManager.registerList(new ApolloVariantList(workspace.nvim, apolloConfig)));

    context.subscriptions.push(
      commands.registerCommand('coc-apollo-graphql.Command', async () => {
        window.showMessage(`coc-apollo-graphql Commands works!`);
      }),

      sources.createSource({
        name: 'coc-apollo-graphql completion source', // unique id
        doComplete: async () => {
          const items = await getCompletionItems();
          return items;
        },
      }),

      workspace.registerKeymap(
        ['n'],
        'apollo-graphql-keymap',
        async () => {
          window.showMessage(`registerKeymap`);
        },
        { sync: false }
      ),

      workspace.registerAutocmd({
        event: ['BufEnter', 'BufWritePost'],
        request: true,
        callback: async () => {
          console.error('FieldStats: ', fieldStats);
          if (loadedSchema.schema) {
            const doc = await workspace.document;
            await doc.buffer.request('nvim_buf_clear_namespace', [virtualTextSrcId, 0, -1]);
            console.error('doc.content: ', doc.content);
            if (doc.content.trim() !== '') {
              const decorations = generateDecorations(doc.content, doc.uri, loadedSchema.schema, fieldStats);
              console.error('decorations: ', JSON.stringify(decorations));
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

async function getCompletionItems(): Promise<CompleteResult> {
  return {
    items: [
      {
        word: 'TestCompletionItem 1',
        menu: '[coc-apollo-graphql]',
      },
      {
        word: 'TestCompletionItem 2',
        menu: '[coc-apollo-graphql]',
      },
    ],
  };
}
