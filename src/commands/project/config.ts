import {Command, Flags} from '@oclif/core'
import Fs from 'fs-extra'
import Path from 'node:path'

import {ProjectConfigOptions} from '../../../interfaces'
import logger from '../../helpers/logger'
import prompt from '../../helpers/prompt'

const MANIFETS_DEFAULT_DIR = './manifest'
const MERGED_MANIFETS_DEFAULT_DIR = './manifest/merged'
const PACKAGES_DEFAULT_DIR = './package'

// type ProjectConfig = {
//   manifest: {
//     mergedPath: string
//     path: string
//   }
//   package: {
//     fullManifestPath: boolean
//     path: string
//     timestamp: boolean
//   }
// }

export default class projectConfig extends Command {
  static description = 'Config local project, must has a ./.git directory'

  static flags = {
    force: Flags.boolean({
      char: 'f',
      default: false,
      description: 'Ignores configuration wizard and generates a new local configuration file',
    }),
    fullManifest: Flags.boolean({aliases: ['use-full-manifest-on-retrieve'], allowNo: false}),
    'ignore-missing-paths': Flags.boolean({char: 'i', default: false, description: "Won't check if current dir has required paths"}),
    manifest: Flags.string({alias: 'manifest-dir', char: 'm', description: 'Manifest dir path'}),
    merged: Flags.string({aliases: ['merged-manifest-dir'], description: 'Destination where will be created all merged manifest files'}),
    package: Flags.string({alias: 'packages-dir', char: 'p', description: 'Packages dir path'}),
    packageTimeStamp: Flags.boolean({aliases: ['package-timestamp'], allowNo: false, description: 'Use timestamp as aditional subfolder on retrieve (default false)'}),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse()

    logger.setOclifContext(this)
    logger.setFilename('config-project')

    logger.logVariable('flags', flags)

    if (flags.manifest && !flags.manifest.startsWith(`./`)) flags.manifest = `./${flags.manifest}`
    if (flags.package && !flags.package.startsWith(`./`)) flags.package = `./${flags.package}`
    if (flags.merged && !flags.merged.startsWith(`./`)) flags.merged = `./${flags.merged}`

    const projectConfig: ProjectConfigOptions.ProjectConfing = {
      manifest: {
        mergedPath: flags.merged,
        path: flags.manifest,
      },
      package: {
        fullManifestPath: flags.fullManifest,
        path: flags.package,
        timestamp: false,
      },
    }

    if (!flags['ignore-missing-paths']) {
      const missingPaths = this.getMissingProjectPaths()

      if (missingPaths.length > 0) {
        const message: string = 'Missing Salesforce project paths not founded: \n - ' + missingPaths.join(`\n - `)
        this.error(message, {message})
      }
    }

    if (flags.force) {
      if (!projectConfig.manifest.path) projectConfig.manifest.path = MANIFETS_DEFAULT_DIR
      if (!projectConfig.manifest.mergedPath) projectConfig.manifest.mergedPath = MERGED_MANIFETS_DEFAULT_DIR
      if (!projectConfig.package.path) projectConfig.package.path = PACKAGES_DEFAULT_DIR
    } else {
      if (!projectConfig.manifest.path) {
        projectConfig.manifest.path = await prompt.path.inquirePath({default: projectConfig.manifest.path, maximumTrys: 3, message: 'Manifestos directory path', type: 'dir'})
      }

      if (!projectConfig.package.path) {
        projectConfig.package.path = await prompt.path.inquirePath({default: projectConfig.package.path, maximumTrys: 3, message: 'Packages directory path', type: 'dir'})
      }

      if (!projectConfig.package.fullManifestPath) {
        // * Confirm
      }

      if (!projectConfig.package.timestamp) {
        // * Confirm
      }
    }

    const confirmCreation = flags.force

    if (confirmCreation) {
      const fileName = '.apex-copilot.json'
      try {
        Fs.writeFileSync(fileName, JSON.stringify(projectConfig, null, 4))

        logger.warn(
          {
            message: `${Path.join(process.cwd(), fileName)}`,
            prompt: true,
            type: 'INFO',
          },
          'Created config file',
        )
      } catch (error) {
        logger.error(`Error when creating file ${fileName}: ${error}`, 'EXCEPTION')
      }
    }
  }

  private getMissingProjectPaths(): Array<string> {
    const requiredPaths = ['.git', 'sfdx-project.json', Path.join('force-app', 'main', 'default')]
    const missingPaths: Array<string> = []

    for (const requiredPath of requiredPaths) {
      if (!Fs.existsSync(Path.join('./', requiredPath))) {
        missingPaths.push(requiredPath)
      }
    }

    return missingPaths
  }
}
