import Fs from 'fs-extra';
import path from 'node:path';

import { ProjectConfigOptions, SfdxProjectJson } from '../../interfaces';
import defaultLogger from './logger';
import { mergeJson } from './utils';

export const LOGS_DEFAULT_DIR = './logs';
export const MANIFETS_DEFAULT_DIR = './manifest';
export const MERGED_MANIFETS_DEFAULT_DIR = './manifest/merged';
export const PACKAGES_DEFAULT_DIR = './package';

export const ORG_CONFIG_FILE_NAME = '.apex-copilot-orgs.json';
export const CONFIG_FILE_NAME = './.apex-copilot.json';
export const SALESFORCE_CONFIG_PATH = './sfdx-project.json';
export const SALESFORCE_API_VERSION = '58.0';

export const blankConfig: ProjectConfigOptions.ProjectConfing = {
	logs: {
		path: './logs',
		save: false,
	},
	manifest: {
		mergedPath: './manifest/merged',
		path: './manifest',
	},
	package: {
		fullManifestPath: true,
		path: './package',
		timestamp: false,
	},
	salesforceApi: SALESFORCE_API_VERSION,
};

export const defaultConfig: ProjectConfigOptions.ProjectConfing = {
	logs: {
		path: LOGS_DEFAULT_DIR,
		save: false,
	},
	manifest: {
		mergedPath: MERGED_MANIFETS_DEFAULT_DIR,
		path: MANIFETS_DEFAULT_DIR,
	},
	package: {
		fullManifestPath: true,
		path: PACKAGES_DEFAULT_DIR,
		timestamp: false,
	},
	salesforceApi: SALESFORCE_API_VERSION,
};

export const defaultSalesforceConfig: SfdxProjectJson = {
	name: 'salesforce-project',
	namespace: '',
	packageDirectories: [
		{
			default: true,
			path: 'force-app',
		},
	],
	sfdcLoginUrl: 'https://login.salesforce.com',
	sourceApiVersion: SALESFORCE_API_VERSION,
};

export function getConfig(): ProjectConfigOptions.ProjectConfing {
	let configLoaded: ProjectConfigOptions.ProjectConfing = defaultConfig;

	const conxtetLogger = defaultLogger.buildLogContext('helpers/cli-config', 'getConfig');
	const CURRENT_PROJECT_CONFIG = path.join(process.cwd(), CONFIG_FILE_NAME);
	const CURRENT_SALESFORCE_CONFIG = path.join(process.cwd(), SALESFORCE_CONFIG_PATH);

	let salesforceConfig = defaultSalesforceConfig;

	try {
		if (Fs.existsSync(CURRENT_SALESFORCE_CONFIG)) {
			// eslint-disable-next-line unicorn/prefer-module
			salesforceConfig = require(CURRENT_SALESFORCE_CONFIG);

			conxtetLogger.methodResponse(salesforceConfig, false, `Loaded salesforce config at ${CURRENT_SALESFORCE_CONFIG}`);
		} else {
			conxtetLogger.log(`${CURRENT_SALESFORCE_CONFIG} not founded`, false, 'INFO');
		}
	} catch (error) {
		conxtetLogger.error(`Error on loading Salesforce config file ${error}. Using default config`);
	}

	try {
		if (Fs.existsSync(CURRENT_PROJECT_CONFIG)) {
			// eslint-disable-next-line unicorn/prefer-module
			configLoaded = require(CURRENT_PROJECT_CONFIG);

			conxtetLogger.methodResponse(configLoaded, true, `Loaded config at ${CURRENT_PROJECT_CONFIG}`);
		} else {
			conxtetLogger.log(`${CURRENT_PROJECT_CONFIG} not founded`, false, 'INFO');
		}
	} catch (error) {
		conxtetLogger.error(`Error on loading config file ${error}. Using default config`);

		conxtetLogger.methodResponse(configLoaded, true, `Loaded default config config`);
	}

	if (configLoaded) {
		configLoaded.salesforceApi = salesforceConfig.sourceApiVersion;
	} else {
		configLoaded = defaultConfig;
	}

	mergeJson(configLoaded, defaultConfig);

	return configLoaded;
}
