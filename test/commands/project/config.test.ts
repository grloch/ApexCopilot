/* eslint-disable @typescript-eslint/no-unused-vars */
import { test } from '@oclif/test';
import { expect } from 'chai';
import { pathExistsSync, readFileSync } from 'fs-extra';
import path from 'node:path';

import { ProjectConfigOptions } from '../../../interfaces';
import { creatEnv } from '../../utils/build-env';

function checkFiles() {
	const checkfiles = ['.apex-copilot-orgs.json', '.apex-copilot.json'];

	for (const f of checkfiles) {
		expect(pathExistsSync(f), `${f} not founded`).to.be.true;
	}
}

describe('project:config', () => {
	beforeEach(creatEnv);

	test
		.stdout({ print: true })
		.command(['project:config', '--auto-generate'])
		.it('command auto-generate', async (ctx) => {
			checkFiles();
		});

	test
		.stdout({ print: true })
		.command(['project:config', '--force', '--quiet-mode', '--ignore-missing-paths', '--logs-path=test/custom/loggin/path'])
		.it('command auto-generate', async (ctx) => {
			checkFiles();

			const newConfigFile: ProjectConfigOptions.ProjectConfing = JSON.parse(readFileSync(path.join(process.cwd(), '.apex-copilot.json'), 'utf8').toString());

			expect(newConfigFile.logs.path).to.be.equal('./test/custom/loggin/path');
		});

	test
		.stdout({ print: true })
		.command(['project:config', '--force', '--quiet-mode', '--ignore-missing-paths', '--package-path=test/custom/package/path'])
		.it('command auto-generate', async (ctx) => {
			checkFiles();

			const newConfigFile: ProjectConfigOptions.ProjectConfing = JSON.parse(readFileSync(path.join(process.cwd(), '.apex-copilot.json'), 'utf8').toString());

			expect(newConfigFile.manifest.path).to.be.equal('./test/custom/package/path');
		});

	afterEach(() => {});
});

// this.log('--force = ' + this.parsedFlags.force, true);
// this.log('--ignore-missing-paths = ' + this.parsedFlags.ignoreMissingPaths, true);
// this.log('--logs-path = ' + this.parsedFlags.logsPath, true);
// this.log('--manifest-path = ' + this.parsedFlags.manifestPath, true);
// this.log('--merged-path = ' + this.parsedFlags.mergedPath, true);
// this.log('--overwrite-files = ' + this.parsedFlags.overwriteFiles, true);
// this.log('--package-path = ' + this.parsedFlags.packagePath, true);
// this.log('--quiet-mode = ' + this.parsedFlags.quietMode, true);
// this.log('--retrieve-use-full-path = ' + this.parsedFlags.retrieveUseFullpath, true);
// this.log('--use-package-timestamp = ' + this.parsedFlags
