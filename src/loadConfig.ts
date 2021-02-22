import { cosmiconfig, defaultLoaders } from 'cosmiconfig';
import TypeScriptLoader from '@endemolshinegroup/cosmiconfig-typescript-loader';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import merge from 'lodash.merge';
import { CocApolloGraphqlExtensionError } from './errors';
import { ApolloConfigFormat, ApolloEngineConfigFormat, ClientServiceConfig } from './apollo';
import { getServiceFromKey } from './utils';
import { CosmiconfigResult } from 'cosmiconfig/dist/types';

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
  let loadedConfig: CosmiconfigResult = null;
  try {
    const explorer = cosmiconfig(MODULE_NAME, {
      searchPlaces: defaultFileNames,
      loaders,
    });

    loadedConfig = await explorer.search(configPath);
  } catch (e) {
    console.error(e);
  }
  let apiKey = '';

  const dotEnvPath = configPath ? path.resolve(configPath, envFileName) : path.resolve(process.cwd(), envFileName);

  if (fs.existsSync(dotEnvPath) && fs.lstatSync(dotEnvPath).isFile()) {
    const env: { [key: string]: string } = dotenv.parse(fs.readFileSync(dotEnvPath));
    const legacyKey = env[legacyKeyEnvVar];
    const key = env[keyEnvVar];
    apiKey = key || legacyKey;
  }

  if (!apiKey) {
    console.warn('No Apollo API Key found');
    // throw new CocApolloGraphqlExtensionError('No Apollo API Key found, make sure it is set in .env');
  }

  let engineConfig: ApolloEngineConfigFormat = {};
  if (apiKey) {
    engineConfig = { engine: { apiKey } };
  }

  let service: string | ClientServiceConfig = '';

  if (loadedConfig && loadedConfig.config.client) {
    if ('service' in loadedConfig.config.client && loadedConfig.config.client.service) {
      service = loadedConfig.config.client.service;
      if (typeof service !== 'string') {
        if ('url' in service) {
          service.kind = 'RemoteServiceConfig';
        } else if ('localSchemaFile' in service) {
          service.kind = 'LocalServiceConfig';
        }
      }
    }
  }

  if (!service) {
    service = getServiceFromKey(apiKey) ?? '';
  }

  if (!service) {
    throw new CocApolloGraphqlExtensionError(
      'No Apollo service found, please make sure it is configured property in apollo.config'
    );
  }

  const config: ApolloConfigFormat = merge(engineConfig, { client: { service } });

  return config;
}
