import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import merge from 'lodash.merge';
import { CocApolloGraphqlExtensionError } from './errors';
import { DefaultClientConfig } from './config';
import { ApolloConfigFormat } from './apollo';
import { getServiceFromKey } from './utils';

// config settings
const envFileName = '.env';
const legacyKeyEnvVar = 'ENGINE_API_KEY';
const keyEnvVar = 'APOLLO_KEY';

interface LoadConfigSettings {
  configPath: string;
  type?: 'client' | 'server';
}

export async function loadConfig({ configPath }: LoadConfigSettings) {
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
  const service = getServiceFromKey(apiKey);

  if (!service) {
    throw new CocApolloGraphqlExtensionError('No Apollo service name found');
  }

  const config: ApolloConfigFormat = merge(engineConfig, { client: DefaultClientConfig }, { client: { service } });

  return config;
}
