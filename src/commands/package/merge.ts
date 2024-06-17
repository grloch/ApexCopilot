import {Args, Command, Flags} from '@oclif/core'
import fs from 'fs-extra'
import path from 'node:path'
import {table} from 'table'

import * as cliDefaultConfigs from '../../helpers/cli-config'
import logger from '../../helpers/logger'
import {PackageController} from '../../helpers/package'
import prompt from '../../helpers/prompt'

export default class Merge extends Command {
  static override args = {
    file: Args.string({description: 'file to read'}),
  }

  static override description = 'describe the command here'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    files: Flags.string({char: 'f', description: 'name to print', multiple: true}),
    force: Flags.boolean({default: false}),
    output: Flags.string({char: 'o', default: 'mergedPackage.xml'}),
  }

  private projectNewConfig = cliDefaultConfigs.blankConfig

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Merge)

    const correntConfig = cliDefaultConfigs.getConfig()

    logger.setOclifContext(this)
    logger.setFilename('merge-package', correntConfig.logs?.save)
    logger.logVariable('flags', flags)

    if (!flags.output.endsWith('.xml')) flags.output += '.xml'
    flags.output = path.join('manifest', flags.output)

    if (fs.existsSync(flags.output)) {
      logger.log({message: `Output path "${flags.output}" already exist`, type: 'INFO'})

      const replaceFile = flags.force || (await prompt.input.confirm(`Replace file at ${flags.output}`))

      if (!replaceFile) {
        return logger.log({message: 'Operation cancelled by user', prompt: true, type: 'INFO'})
      }

      logger.log({message: `Output path "${flags.output}" will be replaced`, type: 'INFO'})
    }

    flags.files = [...new Set<string>((flags.files ?? [])?.map((i) => i.split(',')).flat())].map((i) => path.join(process.cwd(), i))

    if (!flags.force && flags.files?.length < 2) {
      flags.files = await prompt.path.selectManifestFiles()
    }

    const finalPackage = new PackageController()

    if (flags.files.length < 2) {
      logger.error('Inform at least 2 xml files.', 'EXCEPTION')
    }

    for (const file of flags.files) {
      if (fs.existsSync(file)) {
        finalPackage.concatFile(file)
      } else {
        logger.error(`${file} isn't a valid path or not founded`, 'EXCEPTION')
      }
    }

    fs.writeFileSync(flags.output, finalPackage.parseToFile())

    logger.log({message: `New manifest file info:`, prompt: true, type: 'INFO'})
    logger.log({
      message: table([
        ['Manifest file saved at', path.join(process.cwd(), flags.output)],
        ['Merged files', flags.files.join('\n')],
      ]),
      prompt: true,
      type: 'INFO',
    })

    const tableData = []
    for (const typeName of finalPackage.members.keys()) {
      const memberItens = [...(finalPackage.members.get(typeName) ?? [])]

      tableData.push([`${typeName} (${memberItens.length})`, memberItens.join('\n')])
    }

    logger.log({message: table(tableData), prompt: true, type: 'INFO'})

    logger.deleteFile()
  }
}
