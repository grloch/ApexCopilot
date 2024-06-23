import { Command, Flags } from '@oclif/core';
import fs from 'node:fs';
import path from 'node:path';
import { table } from 'table';

import { ProjectConfigOptions } from '../../../interfaces';
import * as cliDefaultConfigs from '../../helpers/cli-config';
import logger from '../../helpers/logger';
import { PackageController } from '../../helpers/package';
import prompt from '../../helpers/prompt';

type MergeScopeFlags = {
	files?: string[];
	force?: boolean;
	keepLog?: boolean;
	output?: string;
};

const DEFAULT_OUTPUT_NAME = 'mergedPackage';

export default class Merge extends Command {
	static override description = 'describe the command here';

	static override examples = ['<%= config.bin %> <%= command.id %>'];

	static override flags = {
		files: Flags.string({ char: 'f', description: 'name to print', multiple: true }),
		force: Flags.boolean({ default: false }),
		keepLog: Flags.boolean({ aliases: ['keep-log'], allowNo: false, description: '' }),
		output: Flags.string({ char: 'o', default: DEFAULT_OUTPUT_NAME }),
	};

	private finalPackage = new PackageController();
	private projectConfig: ProjectConfigOptions.ProjectConfing = cliDefaultConfigs.getConfig();
	private scopeFlags: MergeScopeFlags = {};

	public async run(): Promise<void> {
		this.handleFlags((await this.parse(Merge)).flags);

		logger.setOclifContext(this);
		logger.setFilename('merge-package', this.projectConfig.logs?.save);
		logger.logVariable('flags', this.scopeFlags);

		const preventReplace = await this.handleOutputName();
		if (!preventReplace) {
			return logger.log({ message: 'Operation cancelled by user', prompt: true, type: 'INFO' });
		}

		await this.handleInputFiles();

		if (!this.scopeFlags.output || this.scopeFlags.output.length === 0) {
			return logger.error('Inform a output path', 'EXCEPTION');
		}

		if (!this.scopeFlags.files || this.scopeFlags.files.length === 0) {
			return logger.error('No input file infomed', 'EXCEPTION');
		}

		if (this.scopeFlags.files && this.scopeFlags.files.length > 0) {
			this.finalPackage.concatFile(this.scopeFlags.files);
		}

		this.logResult();

		const confirFileCreation = this.scopeFlags.force || (await prompt.input.confirm('Create file?'));
		if (confirFileCreation) {
			if (!fs.existsSync(this.projectConfig.manifest.mergedPath)) {
				fs.mkdirSync(this.projectConfig.manifest.mergedPath, { recursive: true });
			}

			const outputXmlFile = this.finalPackage.buildFile();
			console.log('this.finalPackage.hasItens', this.finalPackage.hasItens);

			fs.writeFileSync(this.scopeFlags.output, outputXmlFile);
		}

		if (!this.scopeFlags.keepLog) logger.deleteFile();
	}

	private async handleFlags(flags: any) {
		this.scopeFlags = flags;

		this.scopeFlags.output = (this.scopeFlags.output ?? '').trim();
		if (!this.scopeFlags.output || this.scopeFlags.output.length === 0) {
			this.scopeFlags.output = (Merge.flags.output.default as string) ?? DEFAULT_OUTPUT_NAME;

			logger.log({ message: `Output path not informed, using fallback ${this.scopeFlags.output}`, type: 'INFO' });
		}
	}

	private async handleInputFiles() {
		console.log('this.scopeFlags.force', this.scopeFlags.force);

		this.scopeFlags.files = this.scopeFlags?.files ?? [];
		if (this.scopeFlags.files.length > 0) {
			this.scopeFlags.files = this.scopeFlags.files.flatMap((i) => i.split(','));
			this.scopeFlags.files = this.scopeFlags.files.map((i) => path.join(process.cwd(), i));
			this.scopeFlags.files = [...new Set<string>(this.scopeFlags.files.sort())];
		} else if (!this.scopeFlags.force) {
			this.scopeFlags.files = await prompt.files.selectFiles('Select a manifest file', this.projectConfig.manifest.path, {
				filter: ['.xml'],
				minimumSelection: 2,
			});
		}

		if (this.scopeFlags.files.length < 2) {
			logger.error('Inform at least 2 xml files.', 'EXCEPTION');
		}
	}

	private async handleOutputName() {
		let replaceFile = false;
		this.scopeFlags.output = this.scopeFlags.output ?? DEFAULT_OUTPUT_NAME;

		if (this.scopeFlags.output.split(path.sep).length === 1) {
			this.scopeFlags.output = path.join(this.projectConfig.manifest.mergedPath, this.scopeFlags.output);
		}

		if (!this.scopeFlags.output.endsWith('.xml')) this.scopeFlags.output += '.xml';

		if (fs.existsSync(this.scopeFlags.output)) {
			logger.log({ message: `Output path "${this.scopeFlags.output}" already exist`, type: 'INFO' });

			replaceFile = this.scopeFlags.force || (await prompt.input.confirm(`Replace file at ${this.scopeFlags.output}`));

			logger.log({ message: `Output path "${this.scopeFlags.output}" will be replaced`, type: 'INFO' });
		}

		return replaceFile;
	}

	private logResult() {
		logger.log({ message: `New manifest file info:`, prompt: true, type: 'INFO' });
		logger.log({
			message: table([
				// @ts-expect-error: its`n not undefined
				['Manifest file saved at', path.join(process.cwd(), this.scopeFlags.output)],
				// @ts-expect-error: its`n not undefined
				['Merged files', this.scopeFlags.files.join('\n')],
			]),
			prompt: true,
			type: 'INFO',
		});

		const tableData = [];
		for (const typeName of this.finalPackage.membersNames) {
			const memberItens = [...(this.finalPackage.members.get(typeName) ?? [])];

			tableData.push([`${typeName} (${memberItens.length})`, memberItens.join('\n')]);
		}

		logger.log({ message: table(tableData), prompt: true, type: 'INFO' });
	}
}
