import {Command, ux} from '@oclif/core'
import Fs from 'fs-extra'
import Path from 'node:path'
import stripColor from 'strip-color'

import {Logger} from '../../interfaces'
import {cliLogs} from './paths'
import * as utils from './utils'

// type ErrorType = 'ERROR' | 'EXCEPTION'

// type LogType = 'INFO' | 'LOG' | 'METHOD_RETURN' | 'PROCESS_END' | 'PROCESS_START' | 'WARNING' | ErrorType

// type LogOptions = {
//   context?: string
//   message: string
//   prompt?: boolean
//   throwError?: boolean
//   type?: LogType
// }

const IS_DEBUGGIN = true
const FILE_HEADER = (IS_DEBUGGIN ? `IS_DEBUGGIN ${utils.getTimeStamp()}\n` : '') + `TIMESTAMP     | DAY        | TIME     | CONTEXT | TYPE | VALUE`

export class LogController {
  private _commandContext: Command | undefined
  private _filename: string = ''

  private allowBucket = true
  private context: string = 'main'
  private dirPath: string
  private fileCreated = false

  constructor(filename?: string, options?: {containerDir?: string; oclif: Command}) {
    this.dirPath = options?.containerDir ?? cliLogs

    if (options?.oclif) {
      this._commandContext = options?.oclif
    }

    if (filename) this.setFilename(filename)
  }

  get path() {
    return Path.join(this.dirPath, this._filename)
  }

  public buildLogContext(contextName: string) {
    return new LoggerContext(this, contextName)
  }

  public error(message: string, type: Logger.ErrorType = 'ERROR') {
    const terminalStart = ux.colorize(this._commandContext?.config.theme?.error, 'ERROR:')

    const throwError = type === 'EXCEPTION'

    this.log({message, prompt: true, terminalStart, throwError, type})
  }

  public log(options: Logger.LogOptions & {terminalStart?: string; type: Logger.LogType}) {
    let {context} = options

    const {message, prompt, terminalStart, throwError} = options
    context = context ?? this.context ?? ''

    for (let messageItem of message.split('\n')) {
      messageItem = messageItem.trim()

      if (messageItem.length === 0) continue

      if (prompt) console.log(`${terminalStart ? terminalStart + ` ` : ''}${messageItem}`)

      const messageEntrys: string[] = utils.getTimeStamp().split(' ')
      messageEntrys.push(context, options.type, stripColor(messageItem))

      this.appendLine(messageEntrys.map((i) => i ?? '   ').join(' | '))
    }

    if (throwError) {
      throw new Error(ux.colorize(this._commandContext?.config.theme?.error, message + `\n* Log: ${Path.join(process.cwd(), this.path)}`))
    }
  }

  public logVariable(variableName: string, variableValue: object) {
    this.log({
      message: `${variableName.toUpperCase()} value:`,
      prompt: false,
      type: 'LOG',
    })

    this.log({
      message: JSON.stringify(variableValue, null, `|- `)
        .split('\n')
        .filter((i) => {
          i = i.trim()

          return i !== '{' && i !== '}'
        })
        .join('\n'),
      prompt: false,
      type: 'LOG',
    })
  }

  public setFilename(filename: string) {
    if (this._filename?.length > 0) {
      this.error(`LogController.setFilename: log file name already defined (${this._filename})`)
    } else if (!filename || filename.length <= 0) {
      this.error(`LogController.setFilename: new filename not informed`)
    } else {
      filename = filename.split(' ').join('-')
      const timestamp = utils.getTimeStamp().split(':').join('-').split(' ').join('__')

      this._filename = IS_DEBUGGIN ? `${filename}.log` : `${timestamp}_${filename}.log`
    }
  }

  public setOclifContext(oclif: Command) {
    if (this._commandContext !== null) {
      this.error(`LogController.setOclifContext: oclif context already defined (${this._commandContext})`)
    } else if (oclif === null) {
      this.error(`LogController.setFileName: oclif context not informed`)
    } else {
      this._commandContext = oclif
    }
  }

  public warn(options: Logger.LogOptions & {throwError?: boolean}, textStart: string = 'WARNING:') {
    this.log({...options, terminalStart: ux.colorize(this._commandContext?.config.theme?.warning, textStart + ':'), type: 'WARNING'})
  }

  private appendLine(lineText: string) {
    if (this._filename) {
      if (!Fs.existsSync(this.dirPath)) Fs.mkdirSync(this.dirPath, {recursive: true})
      if (!Fs.existsSync(this.path) || (IS_DEBUGGIN && !this.fileCreated)) {
        Fs.writeFileSync(this.path, FILE_HEADER)
        this.fileCreated = true
      }

      if (lineText !== null && lineText.length > 0) {
        Fs.appendFileSync(this.path, '\n' + lineText)
      }
    }
  }
}

export class LoggerContext {
  private contexFinished: boolean = false
  private context: string
  private logger: LogController

  constructor(mainLogger: LogController, context: string) {
    this.logger = mainLogger
    this.context = context

    this.logger.log({context: this.context, message: '', prompt: false, type: 'PROCESS_START'})
  }

  public error(message: string, type: Logger.ErrorType = 'ERROR') {
    this.checkContextEnded()

    this.logger.log({context: this.context, message, prompt: true, throwError: type === 'EXCEPTION', type})
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  public methodResponse(methodResponse: any, finishContext: boolean, label?: string) {
    this.checkContextEnded()

    let message = ''

    if (label) message += label + ': '

    message += methodResponse ? JSON.stringify(methodResponse) : methodResponse

    this.logger.log({
      context: this.context,
      message,
      prompt: false,
      type: 'METHOD_RETURN',
    })

    this.contexFinished = finishContext
  }

  private checkContextEnded() {
    if (this.contexFinished) {
      this.error(`${this.context} has ended, process can't add new logs to file`, 'EXCEPTION')
    }
  }
}

const defaultLogger = new LogController()
export default defaultLogger
