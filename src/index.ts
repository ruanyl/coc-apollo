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
import { reloadSchema } from './reloadSchema';

export async function activate(context: ExtensionContext): Promise<void> {
  const apolloConfig = await loadConfig({ configPath: workspace.root });

  if (apolloConfig) {
    await reloadSchema(apolloConfig, 'current');

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
        event: 'InsertLeave',
        request: true,
        callback: () => {
          window.showMessage(`registerAutocmd on InsertLeave`);
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
