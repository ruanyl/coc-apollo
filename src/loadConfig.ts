import { cosmiconfig, defaultLoaders } from 'cosmiconfig';
import TypeScriptLoader from '@endemolshinegroup/cosmiconfig-typescript-loader';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import merge from 'lodash.merge';
import { CocApolloGraphqlExtensionError } from './errors';
import { DefaultClientConfig } from './config';
import { ApolloConfigFormat } from './apollo';

// config settings
const MODULE_NAME = 'apollo';
const defaultFileNames = [`${MODULE_NAME}.config.js`, `${MODULE_NAME}.config.ts`];
const envFileName = '.env';
const legacyKeyEnvVar = 'ENGINE_API_KEY';
const keyEnvVar = 'APOLLO_KEY';

const loaders = {
  '.json': defaultLoaders['.json'],
  '.js': defaultLoaders['.js'],
  '.ts': TypeScriptLoader,
};

interface LoadConfigSettings {
  configPath: string;
  type?: 'client' | 'server';
}

export async function loadConfig({ configPath }: LoadConfigSettings) {
  const explorer = cosmiconfig(MODULE_NAME, {
    searchPlaces: defaultFileNames,
    loaders,
  });

  const loadedConfig = await explorer.search(configPath);

  if (!loadedConfig) {
    throw new CocApolloGraphqlExtensionError(`No config file found ${defaultFileNames}`);
  }

  let engineConfig = {};
  let apiKey = '';

  const dotEnvPath = configPath ? path.resolve(configPath, envFileName) : path.resolve(process.cwd(), envFileName);

  if (fs.existsSync(dotEnvPath) && fs.lstatSync(dotEnvPath).isFile()) {
    const env: { [key: string]: string } = dotenv.parse(fs.readFileSync(dotEnvPath));
    const legacyKey = env[legacyKeyEnvVar];
    const key = env[keyEnvVar];
    apiKey = key || legacyKey;
  }

  if (apiKey) {
    engineConfig = { engine: { apiKey } };
  }

  if ('service' in loadedConfig?.config) {
    throw new CocApolloGraphqlExtensionError('Config type `service` is not implemented');
  }

  let config: ApolloConfigFormat | null = null;
  if (loadedConfig.config.client) {
    config = merge({ client: DefaultClientConfig }, { client: loadedConfig.config.client });
  }

  if (config && engineConfig) {
    config = merge(engineConfig, config);
  }

  return config;
}
