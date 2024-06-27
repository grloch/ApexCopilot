import { Command, ux } from '@oclif/core';
import Fs from 'fs-extra';
import Path from 'node:path';
import stripColor from 'strip-color';

import { Logger } from '../../interfaces';
import * as global from '../global-variables';
import { cliLogs } from './paths';
import * as utils from './utils';

const IS_DEBUGGIN = global.LOGGER_DEBUG;
const FILE_HEADER = (IS_DEBUGGIN ? `IS_DEBUGGIN ${utils.getTimeStamp()}\n` : '') + `TIMESTAMP     | DAY        | TIME     | CONTEXT | TYPE | VALUE`;

export class LogController {
	private _commandContext: Command | undefined;
	private _filename: string = '';

	private allowSave: boolean | undefined = undefined;
	private context: string = 'main';
	private dirPath: string;
	private fileCreated = false;

	constructor(filename?: string, options?: { containerDir?: string; oclif: Command }) {
		this.dirPath = options?.containerDir ?? cliLogs;

		if (options?.oclif) {
			this._commandContext = options?.oclif;
		}

		if (filename) this.setFilename(filename);
	}

	get path() {
		return Path.join(this.dirPath, this._filename);
	}

	public buildLogContext(filePath: string, functionName: string) {
		return new LoggerContext(this, filePath, functionName);
	}

	public deleteFile(prompt: boolean = true) {
		this.allowSave = false;

		if (this.fileCreated && Fs.existsSync(this.path) && !IS_DEBUGGIN) {
			try {
				Fs.unlinkSync(this.path);

				if (prompt) {
					console.log(`\nFile at ${this.path} deleted!`);
				}
			} catch (error) {
				if (prompt) {
					console.log('Cant`t delete log at ' + this.path + '\n' + error);
				}
			}
		}
	}

	public error(message: string, type: Logger.ErrorType = 'ERROR') {
		const terminalStart = ux.colorize(this._commandContext?.config.theme?.error, 'ERROR:');

		const throwError = type === 'EXCEPTION';

		this.log({ message, prompt: true, terminalStart, throwError, type });
	}

	public log(options: { terminalStart?: string; type: Logger.LogType } & Logger.LogOptions) {
		let { context } = options;

		const { message, prompt, terminalStart, throwError } = options;
		context = context ?? this.context ?? '';

		for (let messageItem of message.split('\n')) {
			messageItem = messageItem.trim();

			if (messageItem.length === 0) continue;

			if (prompt || IS_DEBUGGIN) console.log(!prompt && IS_DEBUGGIN ? `[[DEBUGGIN]] ` : '', `${terminalStart ? terminalStart + ` ` : ''}${messageItem}`);

			const messageEntrys: string[] = utils.getTimeStamp().split(' ');
			messageEntrys.push(context, options.type, stripColor(messageItem));

			this.appendLine(messageEntrys.map((i) => i ?? '   ').join(' | '));
		}

		if (throwError) {
			throw new Error(ux.colorize(this._commandContext?.config.theme?.error, message + `\n* Log: ${Path.join(process.cwd(), this.path)}`));
		}
	}

	public logVariable(variableName: string, variableValue: object) {
		this.log({
			message: `${variableName.toUpperCase()} value:`,
			prompt: false,
			type: 'LOG',
		});

		this.log({
			message: JSON.stringify(variableValue, null, `|- `)
				.split('\n')
				.filter((i) => {
					i = i.trim();

					return i !== '{' && i !== '}';
				})
				.join('\n'),
			prompt: false,
			type: 'LOG',
		});
	}

	public setAllowSave(allowSave: boolean | undefined) {
		if ((allowSave === true || allowSave === false) && this.allowSave !== allowSave && this.allowSave !== true) {
			this.log({ message: 'Log saving changed to: ' + this.allowSave, prompt: false, type: 'LOG' });

			this.allowSave = allowSave;
		}
	}

	public setFilename(filename: string, allowSave?: boolean) {
		if (this._filename?.length > 0) {
			this.error(`LogController.setFilename: log file name already defined (${this._filename})`);
		} else if (!filename || filename.length <= 0) {
			this.error(`LogController.setFilename: new filename not informed`);
		} else {
			filename = filename.split(' ').join('-');
			const timestamp = utils.getTimeStamp().split(':').join('-').split(' ').join('__');

			this._filename = IS_DEBUGGIN ? `${filename}.log` : `${timestamp}_${filename}.log`;
		}

		if (allowSave !== undefined) this.setAllowSave(allowSave);
	}

	public setOclifContext(oclif: any) {
		if (this._commandContext !== undefined) {
			this.error(`LogController.setOclifContext: oclif context already defined (${this._commandContext})`);
		} else if (oclif === null) {
			this.error(`LogController.setFileName: oclif context not informed`);
		} else {
			this._commandContext = oclif;
		}
	}

	public warn(options: { throwError?: boolean } & Logger.LogOptions, textStart: string = 'WARNING:') {
		this.log({ ...options, terminalStart: ux.colorize(this._commandContext?.config.theme?.warning, textStart + ':'), type: 'WARNING' });
	}

	private appendLine(lineText: string) {
		if (this.allowSave !== true) return;

		if (this._filename) {
			if (!Fs.existsSync(this.dirPath)) Fs.mkdirSync(this.dirPath, { recursive: true });
			if (!Fs.existsSync(this.path) || (IS_DEBUGGIN && !this.fileCreated)) {
				Fs.writeFileSync(this.path, FILE_HEADER);
				this.fileCreated = true;
			}

			if (lineText !== null && lineText.length > 0) {
				Fs.appendFileSync(this.path, '\n' + lineText);
			}
		}
	}
}

export class LoggerContext {
	private contexFinished: boolean = false;
	private context: string;
	private logger: LogController;

	constructor(mainLogger: LogController, filePath: string, functionName: string) {
		this.logger = mainLogger;
		this.context = `${filePath} ${functionName}`;

		this.logger.log({ context: this.context, message: '', prompt: false, type: 'PROCESS_START' });
	}

	public error(message: string, type: Logger.ErrorType = 'ERROR') {
		this.checkContextEnded();

		this.logger.log({ context: this.context, message, prompt: true, throwError: type === 'EXCEPTION', type });
	}

	public log(message: string, prompt: boolean, type: Logger.LogType) {
		this.logger.log({ context: this.context, message, prompt, throwError: type === 'EXCEPTION', type });
	}

	public methodResponse(methodResponse: any, finishContext: boolean, label?: string) {
		this.checkContextEnded();

		let message = '';

		if (label) message += label + ': ';

		message += methodResponse ? JSON.stringify(methodResponse) : methodResponse;

		this.logger.log({
			context: this.context,
			message,
			prompt: false,
			type: 'METHOD_RETURN',
		});

		this.contexFinished = finishContext;
	}

	private checkContextEnded() {
		if (this.contexFinished) {
			this.error(`${this.context} has ended, process can't add new logs to file`, 'EXCEPTION');
		}
	}
}

const defaultLogger = new LogController();
export default defaultLogger;
