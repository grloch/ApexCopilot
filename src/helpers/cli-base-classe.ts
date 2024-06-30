import { Command, Flags } from '@oclif/core';
import Fs from 'fs-extra';

import { Logger, ProjectConfigOptions } from '../../interfaces';
import * as globalVariables from '../global-variables';
import * as cliDefaultConfigs from './cli-config';
import logger from './logger';
import { printJson, printTitle } from './print';
import prompt from './prompt';

export default abstract class CliBase extends Command {
	protected globalVariables = globalVariables;
	protected logger = logger;
	protected projectConfig: ProjectConfigOptions.ProjectConfing = cliDefaultConfigs.getConfig();
	private printedTitles = new Set<string>();

	get allowPrompt() {
		return !this.parsedFlags?.quietMode;
	}

	get prompt() {
		return prompt;
	}

	public async checkOverwriteFiles(lstFilePath: Array<string> = []) {
		if (this.parsedFlags?.overwriteFiles) {
			this.logger.log({ message: 'Overwriting files active, files will be overwriten', prompt: this.allowPrompt, type: 'INFO' });
			return true;
		}

		if (this.parsedFlags?.force) {
			this.logger.log({ message: 'Forcing execution, files will be overwriten', prompt: this.allowPrompt, type: 'INFO' });
			return true;
		}

		/* eslint no-await-in-loop: off */
		for (const filePath of lstFilePath) {
			if (Fs.existsSync(filePath)) {
				const overwriteFile = await this.confirmForcedFlag(`"${filePath}" already exists, overwrite it?`);

				if (!overwriteFile) return false;
			}
		}

		return true;
	}

	public async confirmForcedFlag(question: string) {
		const response = this.parsedFlags.force || (await prompt.input.confirm(question));

		this.log(`Confirmation: ${question}: ${response}`);

		return response;
	}

	public createJsonFile(filePath: string, jsonObject: object) {
		try {
			Fs.writeFileSync(filePath, JSON.stringify(jsonObject, null, 4));

			this.logger.warn({ message: filePath, prompt: this.allowPrompt, type: 'INFO' }, 'Created file');
		} catch (error) {
			this.logger.log({
				context: this.contextName,
				message: `Error while creating file ${filePath}: ${error}`,
				prompt: this.allowPrompt,
				type: 'INFO',
			});
		}
	}

	public endProcess() {}

	exitMessage(message: string, prompt: boolean, type: Logger.LogType, exitCode: 0 | 1) {
		logger.log({ message, prompt: prompt && this.allowPrompt, type });

		!this.parsedFlags?.quietMode && this.log('Exit code: ' + exitCode);
		return this.exit(exitCode);
	}

	override log(message: string, prompt: boolean = false) {
		this.logger.log({ message, prompt: this.allowPrompt && prompt, type: 'LOG' });
	}

	printJson(message: string, jsonObject: any) {
		this.logger.log({ message, prompt: this.allowPrompt, type: 'INFO' });
		this.logger.log({ message: printJson(jsonObject), prompt: this.allowPrompt, type: 'INFO' });
	}

	printSpacer() {
		if (this.allowPrompt) {
			const terminalSize = process.stdout.columns;

			console.log(`\n${' '.repeat(terminalSize * 0.1)}${'─'.repeat(terminalSize * 0.5)}\n`);
		}
	}

	printTitle(text: string) {
		if (!this.parsedFlags?.quietMode && !this.printedTitles.has(text)) {
			this.printedTitles.add(text);

			printTitle(text);
		}
	}

	async run(): Promise<void> {
		console.clear();

		await this.initExecution();
		await this.parseFlags();

		this.logger.setAllowSave(true);
	}

	private checkPathVar(varName: string, defaultValue: string, flagValue?: string) {
		if (this.parsedFlags) {
			if (flagValue !== undefined && flagValue !== null) {
				this.parsedFlags[varName] = flagValue.trim();
			}

			if (this.parsedFlags[varName] === null || this.parsedFlags[varName] === undefined || this.parsedFlags[varName].length === 0) {
				this.parsedFlags[varName] = defaultValue;
			}

			if (!this.parsedFlags[varName].startsWith(`./`)) {
				this.parsedFlags[varName] = `./${this.parsedFlags[varName]}`;
			}
		}
	}

	private async initExecution() {
		if (!this.contextName || this.contextName.trim().length === 0) {
			this.exitMessage('Command context name not founded!', true, 'EXCEPTION', 1);
		}

		this.contextName = this.contextName.trim();

		const { flags } = await this.parse();

		this.logger.setOclifContext(this);
		this.logger.setFilename(this.contextName, this.projectConfig.logs?.save);
		this.logger.logVariable('flags', flags);
	}

	abstract contextName: string;
	abstract parsedFlags: any;
	abstract parseFlags(): void;
}
