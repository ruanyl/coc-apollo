import { cosmiconfig, defaultLoaders } from 'cosmiconfig';
import TypeScriptLoader from '@endemolshinegroup/cosmiconfig-typescript-loader';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import merge from 'lodash.merge';
import { CocApolloGraphqlExtensionError } from './errors';
import { ApolloConfigFormat } from './apollo';
import { getServiceFromKey } from './utils';

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
  let apiKey = '';

  const dotEnvPath = configPath ? path.resolve(configPath, envFileName) : path.resolve(process.cwd(), envFileName);

  if (fs.existsSync(dotEnvPath) && fs.lstatSync(dotEnvPath).isFile()) {
    const env: { [key: string]: string } = dotenv.parse(fs.readFileSync(dotEnvPath));
    const legacyKey = env[legacyKeyEnvVar];
    const key = env[keyEnvVar];
    apiKey = key || legacyKey;
  }

  if (!apiKey) {
    throw new CocApolloGraphqlExtensionError('No Apollo API Key fond, make sure it is set in .env');
  }

  const engineConfig = { engine: { apiKey } };
  let service = '';

  if (loadedConfig && loadedConfig.config.client) {
    if ('service' in loadedConfig.config.client) {
      if (typeof loadedConfig.config.client.service === 'string') {
        service = loadedConfig.config.client.service;
      } else if ('name' in loadedConfig.config.client.service) {
        service = loadedConfig.config.client.service.name;
      }
    }
  }

  if (!service) {
    service = getServiceFromKey(apiKey) ?? '';
  }

  if (!service) {
    throw new CocApolloGraphqlExtensionError('No Apollo service name found');
  }

  const config: ApolloConfigFormat = merge(engineConfig, { client: { service } });

  return config;
}
