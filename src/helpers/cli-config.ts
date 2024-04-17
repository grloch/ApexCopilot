import Fs from 'fs-extra'
import path from 'node:path'

import {ProjectConfigOptions} from '../../interfaces'
import defaultLogger from './logger'

export const LOGS_DEFAULT_DIR = './logs'
export const MANIFETS_DEFAULT_DIR = './manifest'
export const MERGED_MANIFETS_DEFAULT_DIR = './manifest/merged'
export const PACKAGES_DEFAULT_DIR = './package'
export const CONFIG_FILE_NAME = './.apex-copilot.json'

export const blankConfig: ProjectConfigOptions.ProjectConfing = {
  logs: {
    path: undefined,
    save: false,
  },
  manifest: {
    mergedPath: undefined,
    path: undefined,
  },
  package: {
    fullManifestPath: true,
    path: undefined,
    timestamp: false,
  },
}

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
}

export function getConfig(): ProjectConfigOptions.ProjectConfing {
  let configLoaded: ProjectConfigOptions.ProjectConfing = defaultConfig

  const conxtetLogger = defaultLogger.buildLogContext('helpers/cli-config', 'getConfig')

  const CURRENT_PROJECT_CONFIG = path.join(process.cwd(), CONFIG_FILE_NAME)

  try {
    if (Fs.existsSync(CURRENT_PROJECT_CONFIG)) {
      configLoaded = require(CURRENT_PROJECT_CONFIG)

      conxtetLogger.methodResponse(configLoaded, true, `Loaded config at ${CURRENT_PROJECT_CONFIG}`)
    } else {
      conxtetLogger.log(`${CURRENT_PROJECT_CONFIG} not founded`, false, 'INFO')
    }
  } catch (error) {
    conxtetLogger.error(`Error on loading config file ${error}`)
    conxtetLogger.error(`Using default config`)

    conxtetLogger.methodResponse(configLoaded, true, `Loaded default config config`)
  }

  if (!configLoaded) {
    configLoaded = defaultConfig
  }

  return configLoaded
}
