import { Flags } from '@oclif/core';
import Fs from 'fs-extra';
import Path from 'node:path';

import CliBase from '../../helpers/cli-base-classe';
import * as cliDefaultConfigs from '../../helpers/cli-config';
import { select } from '../../helpers/prompt/input';
import { listDeviceOrgsAsSelectOption, removeOrgItemOption } from '../../helpers/sfdx';

const DEFAULT_LOG_PATH = './logs';
const DEFAULT_MANIFEST_PATH = './manifest';
const DEFAULT_MERGED_PATH = './manifest/merged';
const DEFAULT_PACKAGE_PATH = './package';

const AUTOGENERATE_DESCRIPTION = `Generate default project config. Flags informed won't be overwrite, define:
--force=true
--ignore-missing-paths=true
--keep-log=true
--logs-path="${DEFAULT_LOG_PATH}"
--manifest-path="${DEFAULT_MANIFEST_PATH}"
--merged-path="${DEFAULT_MERGED_PATH}"
--overwrite-files=true
--package-path="${DEFAULT_PACKAGE_PATH}"
--quiet-mode=false
--retrieve-use-full-path=false
--use-package-timestamp=false`;

class CommandScopeFlags {
	public autoGenerate: boolean = false;
	public force: boolean = false;
	public ignoreMissingPaths: boolean;
	public keepLog: boolean = false;
	public logsPath: string;
	public manifestPath: string;
	public mergedPath: string;
	public overwriteFiles: boolean = false;
	public packagePath: string;
	public quietMode: boolean = false;
	public retrieveUseFullpath: boolean = false;
	public usePackageTimeStamp: boolean = false;

	constructor(flags: any) {
		this.force = flags.force;
		this.autoGenerate = flags['auto-generate'];
		this.quietMode = flags['quiet-mode'];
		this.keepLog = flags['keep-log'];
		this.ignoreMissingPaths = flags['ignore-missing-paths'];

		this.overwriteFiles = flags['overwrite-files'];
		this.retrieveUseFullpath = flags['retrieve-use-full-path'];
		this.usePackageTimeStamp = flags['use-package-timestamp'];

		this.checkPathVar('logsPath', DEFAULT_LOG_PATH, flags['logs-path']);
		this.checkPathVar('packagePath', DEFAULT_LOG_PATH, flags['package-path']);
		this.checkPathVar('manifestPath', DEFAULT_LOG_PATH, flags['manifest-path']);
		this.checkPathVar('mergedPath', DEFAULT_LOG_PATH, flags['merged-path']);

		if (this.quietMode) {
			this.force = true;
			if (this.ignoreMissingPaths === undefined) this.ignoreMissingPaths = true;
		}

		if (this.autoGenerate) {
			this.force = true;
			this.ignoreMissingPaths = true;
			this.quietMode = true;

			this.keepLog = true;
			this.retrieveUseFullpath = false;
			this.usePackageTimeStamp = false;
			this.overwriteFiles = true;

			this.logsPath = this.logsPath || DEFAULT_LOG_PATH;
			this.packagePath = DEFAULT_PACKAGE_PATH;
			this.manifestPath = DEFAULT_MANIFEST_PATH;
			this.mergedPath = DEFAULT_MERGED_PATH;
			this.usePackageTimeStamp = false;
		}
	}

	private checkPathVar(varName: 'logsPath' | 'manifestPath' | 'mergedPath' | 'packagePath', defaultValue: string, flagValue?: string) {
		if (flagValue !== undefined && flagValue !== null) {
			this[varName] = flagValue.trim();
		}

		if (this[varName] === null || this[varName] === undefined || this[varName].length === 0) {
			this[varName] = defaultValue;
		}

		if (!this[varName].startsWith(`./`)) {
			this[varName] = `./${this[varName]}`;
		}
	}
}

const orgconfigFileModel = {
	production: null as string,
	// eslint-disable-next-line perfectionist/sort-objects
	homologation: null as string,
	testing: null as string,
	// eslint-disable-next-line perfectionist/sort-objects
	development: null as string,
	others: null as string,
};

const requiredPaths = ['.git', 'sfdx-project.json', Path.join('force-app', 'main', 'default')];

export default class ProjectConfig extends CliBase {
	static description = 'Config local project, must has a ./.git directory';

	static override examples = ['<%= config.bin %> <%= command.id %>'];

	static flags = {
		'auto-generate': Flags.boolean({ default: false, description: AUTOGENERATE_DESCRIPTION }),
		force: Flags.boolean({ char: 'f', default: false, description: 'Ignores configuration wizard and execute command' }),
		'ignore-missing-paths': Flags.boolean({ allowNo: true, default: false, description: `Won't check if current dir has required paths:\n${requiredPaths.join('\n')}` }),
		'keep-log': Flags.boolean({ allowNo: false, default: false, description: 'Keep config log after execution even if it was successfull' }),
		'logs-path': Flags.string({ char: 'l', default: DEFAULT_LOG_PATH, description: 'Logs dir path on project' }),
		'manifest-path': Flags.string({ char: 'm', default: DEFAULT_MANIFEST_PATH, description: 'Manifest dir path on project' }),
		'merged-path': Flags.string({ default: DEFAULT_MERGED_PATH, description: 'Destination where all merged manifest files will be created' }),
		'overwrite-files': Flags.boolean({ allowNo: false, default: false, description: 'Overwrite existing files' }),
		'package-path': Flags.string({ char: 'p', default: DEFAULT_PACKAGE_PATH, description: 'Packages dir path on project' }),
		'quiet-mode': Flags.boolean({ default: false, description: 'Execute in quiet mode, implies: --force=true, --ignore-missing-paths=true. will overwrite all files' }),
		'retrieve-use-full-path': Flags.boolean({ default: false, description: 'Set project to use full manifest path on retreving' }),
		'use-package-timestamp': Flags.boolean({ default: false, description: 'Use timestamp as aditional subfolder on retrieve' }),
	};

	contextName = 'config-project';

	declare parsedFlags: CommandScopeFlags;

	private projectNewConfig = cliDefaultConfigs.blankConfig;

	async parseFlags() {
		const { flags } = await this.parse();

		this.parsedFlags = new CommandScopeFlags(flags);
	}

	async run(): Promise<void> {
		await super.run();

		if (this.parsedFlags.autoGenerate) {
			this.printTitle('Auto Generate');
			this.log('Generating default config', true);

			this.log('--force = ' + this.parsedFlags.force, true);
			this.log('--ignore-missing-paths = ' + this.parsedFlags.ignoreMissingPaths, true);
			this.log('--logs-path = ' + this.parsedFlags.logsPath, true);
			this.log('--manifest-path = ' + this.parsedFlags.manifestPath, true);
			this.log('--merged-path = ' + this.parsedFlags.mergedPath, true);
			this.log('--overwrite-files = ' + this.parsedFlags.overwriteFiles, true);
			this.log('--package-path = ' + this.parsedFlags.packagePath, true);
			this.log('--quiet-mode = ' + this.parsedFlags.quietMode, true);
			this.log('--retrieve-use-full-path = ' + this.parsedFlags.retrieveUseFullpath, true);
			this.log('--use-package-timestamp = ' + this.parsedFlags.usePackageTimeStamp, true);
		}

		this.printTitle('Check overwriting files');

		const overwriteAllExistingFiles =
			this.parsedFlags.ignoreMissingPaths || (await this.checkOverwriteFiles([cliDefaultConfigs.CONFIG_FILE_NAME, cliDefaultConfigs.ORG_CONFIG_FILE_NAME]));
		if (!overwriteAllExistingFiles) this.exitMessage('Operation cancelled by user', true, 'INFO', 0);

		for (const i of [cliDefaultConfigs.CONFIG_FILE_NAME, cliDefaultConfigs.ORG_CONFIG_FILE_NAME]) {
			if (Fs.existsSync(i)) {
				this.logger.log({ message: `"${Path.join(process.cwd(), i)}" will be overwriten`, prompt: false, type: 'INFO' });
			}
		}

		if (!this.parsedFlags.ignoreMissingPaths) {
			const missingPaths = this.getMissingProjectRequiredPaths();

			if (missingPaths.length > 0) {
				this.exitMessage('Missing Salesforce project paths not founded: \n - ' + missingPaths.join(`\n - `), true, 'INFO', 1);
			}
		}

		this.projectNewConfig.logs.path = this.parsedFlags.logsPath;
		this.projectNewConfig.manifest.path = this.parsedFlags.manifestPath;
		this.projectNewConfig.manifest.mergedPath = this.parsedFlags.mergedPath;
		this.projectNewConfig.package.path = this.parsedFlags.packagePath;

		this.projectNewConfig.package.fullManifestPath = this.parsedFlags.retrieveUseFullpath;
		this.projectNewConfig.package.timestamp = this.parsedFlags.usePackageTimeStamp;

		if (!this.parsedFlags.force) {
			if (this.parsedFlags.logsPath === DEFAULT_LOG_PATH) {
				this.printTitle('Logs');
				this.projectNewConfig.logs.path = await this.prompt.path.inquirePath({ default: this.parsedFlags.logsPath, message: 'Set log dir', type: 'dir' });
			}

			if (!this.parsedFlags.force) {
				this.printTitle('Logs');
				this.projectNewConfig.logs.save = await this.prompt.input.confirm('Save successfull logs?', { labels: { cancel: 'No', confirm: 'Yes' } });
			}

			if (this.parsedFlags.manifestPath === DEFAULT_MANIFEST_PATH) {
				this.printTitle('Manifest');

				this.projectNewConfig.manifest.path = await this.prompt.path.inquirePath({ default: this.parsedFlags.manifestPath, message: 'Set manifest dir', type: 'dir' });
			}

			if (this.parsedFlags.mergedPath === DEFAULT_MERGED_PATH) {
				this.printTitle('Manifest');

				this.projectNewConfig.manifest.mergedPath = await this.prompt.path.inquirePath({ default: this.parsedFlags.mergedPath, message: 'Set merged manifest dir', type: 'dir' });
			}

			if (this.parsedFlags.packagePath === DEFAULT_PACKAGE_PATH) {
				this.printTitle('Package');

				this.projectNewConfig.package.path = await this.prompt.path.inquirePath({ default: this.parsedFlags.packagePath, message: 'Set package dir', type: 'dir' });
			}

			if (!this.parsedFlags.force && !this.projectNewConfig.package.fullManifestPath) {
				this.printTitle('Package');

				this.projectNewConfig.package.fullManifestPath = await this.prompt.input.confirm('Use full path on retrieve?', { labels: { cancel: 'No', confirm: 'Yes' } });
			}

			if (!this.parsedFlags.force && !this.projectNewConfig.package.fullManifestPath) {
				this.printTitle('Package');

				this.projectNewConfig.package.timestamp = await this.prompt.input.confirm('Timestamp packages path on retrieve?', { labels: { cancel: 'No', confirm: 'Yes' } });
			}

			this.printTitle('Orgs');
			const salesforceOrgs = await listDeviceOrgsAsSelectOption();
			salesforceOrgs.push({ name: 'None', value: null });

			orgconfigFileModel.production = await select('Select production org alias', { choices: salesforceOrgs });
			if (orgconfigFileModel.production) removeOrgItemOption(salesforceOrgs, orgconfigFileModel.production);

			orgconfigFileModel.homologation = await select('Select homologation org alias', { choices: salesforceOrgs });
			if (orgconfigFileModel.homologation) removeOrgItemOption(salesforceOrgs, orgconfigFileModel.homologation);

			orgconfigFileModel.testing = await select('Select testing org alias', { choices: salesforceOrgs });
			if (orgconfigFileModel.testing) removeOrgItemOption(salesforceOrgs, orgconfigFileModel.testing);

			orgconfigFileModel.development = await select('Select development org alias', { choices: salesforceOrgs });
			if (orgconfigFileModel.development) removeOrgItemOption(salesforceOrgs, orgconfigFileModel.development);
		}

		this.printTitle('Confirm creation');
		this.printJson('New project config:', this.projectNewConfig);
		this.printSpacer();

		this.printJson('New project org options:', orgconfigFileModel);
		this.printSpacer();

		if (await this.confirmForcedFlag('Confirm creation?')) {
			try {
				this.createJsonFile(Path.join(process.cwd(), cliDefaultConfigs.CONFIG_FILE_NAME), this.projectNewConfig);
			} catch (error) {
				this.logger.error(`Error when creating file ${cliDefaultConfigs.CONFIG_FILE_NAME}: ${error}`, 'EXCEPTION');
			}

			try {
				this.createJsonFile(Path.join(process.cwd(), cliDefaultConfigs.ORG_CONFIG_FILE_NAME), orgconfigFileModel);
			} catch (error) {
				this.logger.error(`Error when creating file ${cliDefaultConfigs.ORG_CONFIG_FILE_NAME}: ${error}`, 'EXCEPTION');
			}

			if (!this.parsedFlags.keepLog) {
				this.logger.deleteFile(this.allowPrompt);
			}
		}

		console.log('Config files created');
	}

	private getMissingProjectRequiredPaths(): Array<string> {
		const missingPaths: Array<string> = [];

		for (const requiredPath of requiredPaths) {
			if (!Fs.existsSync(Path.join('./', requiredPath))) {
				missingPaths.push(requiredPath);
			}
		}

		return missingPaths;
	}
}

// TODO Create global config
// TODO Check global config first before load
