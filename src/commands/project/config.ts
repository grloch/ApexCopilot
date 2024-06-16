import {Command, Flags} from '@oclif/core'
import Fs from 'fs-extra'
import Path from 'node:path'

import * as cliDefaultConfigs from '../../helpers/cli-config'
import logger from '../../helpers/logger'
import {printJson, printTitle} from '../../helpers/print'
import prompt from '../../helpers/prompt'

type CommandScopeFlags = {
  force?: boolean
  keepLog?: boolean
  log?: string
  manifest?: string
  merged?: string
  package?: string
  packageTimeStamp?: boolean
}

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
    keepLog: Flags.boolean({aliases: ['keep-log'], allowNo: false, description: ''}),
    log: Flags.string({alias: 'log-dir', char: 'l', description: 'Logs dir path'}),
    manifest: Flags.string({alias: 'manifest-dir', char: 'm', description: 'Manifest dir path'}),
    merged: Flags.string({aliases: ['merged-manifest-dir'], description: 'Destination where will be created all merged manifest files'}),
    package: Flags.string({alias: 'packages-dir', char: 'p', description: 'Packages dir path'}),
    packageTimeStamp: Flags.boolean({aliases: ['package-timestamp'], allowNo: false, description: 'Use timestamp as aditional subfolder on retrieve (default false)'}),
  }

  private projectNewConfig = cliDefaultConfigs.blankConfig
  private scopeFlags: CommandScopeFlags = {}

  async applyFlags(flags: any) {
    const pathFlags = ['manifest', 'package', 'log', 'merged']
    for (const flagName of pathFlags) {
      if (flags[flagName] && !flags[flagName].startsWith(`./`)) flags[flagName] = `./${flags[flagName]}`
    }

    this.scopeFlags = flags
  }

  async run(): Promise<void> {
    const {flags} = await this.parse()
    this.applyFlags(flags)

    const correntConfig = cliDefaultConfigs.getConfig()

    logger.setOclifContext(this)
    logger.setFilename('config-project', correntConfig.logs?.save)
    logger.logVariable('flags', flags)

    let blockOverwrite = false
    if (Fs.existsSync(cliDefaultConfigs.CONFIG_FILE_NAME)) {
      !flags.force && printTitle('Confirm overwrite')

      blockOverwrite = flags.force || (await prompt.input.confirm(`${cliDefaultConfigs.CONFIG_FILE_NAME} already exists, overwrite it?`))

      if (!blockOverwrite) {
        return logger.log({message: 'Operation cancelled by user', prompt: true, type: 'INFO'})
      }
    }

    if (!flags['ignore-missing-paths']) {
      const missingPaths = this.getMissingProjectPaths()

      if (missingPaths.length > 0) {
        const message: string = 'Missing Salesforce project paths not founded: \n - ' + missingPaths.join(`\n - `)
        this.error(message, {message})
      }
    }

    this.applyProjectDefaults()

    this.setupManifestOptions()

    this.setupPackageOptions()

    this.setupLogsOptions()

    !flags.force && printTitle('Confirm creation')

    const confirmCreation = flags.force || (await prompt.input.confirm(`Confirm creation?`))

    console.log('New project config:')
    printJson(this.projectNewConfig)

    if (confirmCreation) {
      const fileName = '.apex-copilot.json'
      try {
        Fs.writeFileSync(fileName, JSON.stringify(this.projectNewConfig, null, 4))

        logger.warn(
          {
            message: `${Path.join(process.cwd(), fileName)}`,
            prompt: true,
            type: 'INFO',
          },
          'Created config file',
        )

        !this.scopeFlags.keepLog && logger.deleteFile()
      } catch (error) {
        logger.error(`Error when creating file ${fileName}: ${error}`, 'EXCEPTION')
      }
    }
  }

  private applyProjectDefaults() {
    this.projectNewConfig.manifest.path = this.scopeFlags.manifest
    this.projectNewConfig.manifest.mergedPath = this.scopeFlags.merged
    this.projectNewConfig.package.path = this.scopeFlags.package
    this.projectNewConfig.logs.path = this.scopeFlags.log ?? cliDefaultConfigs.LOGS_DEFAULT_DIR
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

  private async setupLogsOptions() {
    !this.scopeFlags.force && printTitle('LOGS')

    this.projectNewConfig.logs.save = this.scopeFlags.force ?? (await prompt.input.confirm(`Save logs?`))
  }

  private async setupManifestOptions() {
    !this.scopeFlags.force && !this.projectNewConfig.manifest.path && !this.projectNewConfig.manifest.mergedPath && printTitle('Manifest')

    if (!this.projectNewConfig.manifest.path) {
      this.projectNewConfig.manifest.path = this.scopeFlags.force
        ? cliDefaultConfigs.MANIFETS_DEFAULT_DIR
        : await prompt.path.inquirePath({default: cliDefaultConfigs.MANIFETS_DEFAULT_DIR, maximumTrys: 3, message: 'Manifestos directory path', type: 'dir'})
    }

    if (!this.projectNewConfig.manifest.mergedPath) {
      this.projectNewConfig.manifest.mergedPath = this.scopeFlags.force
        ? cliDefaultConfigs.MERGED_MANIFETS_DEFAULT_DIR
        : await prompt.path.inquirePath({default: cliDefaultConfigs.MERGED_MANIFETS_DEFAULT_DIR, maximumTrys: 3, message: 'Merged manifestos directory path', type: 'dir'})
    }
  }

  private async setupPackageOptions() {
    !this.scopeFlags.force && !this.projectNewConfig.package.path && printTitle('Package')

    if (!this.projectNewConfig.package.path) {
      this.projectNewConfig.package.path = this.scopeFlags.force
        ? cliDefaultConfigs.PACKAGES_DEFAULT_DIR
        : await prompt.path.inquirePath({default: cliDefaultConfigs.PACKAGES_DEFAULT_DIR, maximumTrys: 3, message: 'Packages manifestos directory path', type: 'dir'})
    }

    this.projectNewConfig.package.fullManifestPath = this.scopeFlags.force ?? (await prompt.input.confirm(`Use full path on retrieve?`))
    this.projectNewConfig.package.timestamp = this.scopeFlags.packageTimeStamp || this.scopeFlags.force ? false : await prompt.input.confirm(`Timestamp packages path on retrieve?`)
  }
}
