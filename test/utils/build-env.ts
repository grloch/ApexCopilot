import * as fs from 'fs-extra';
import path from 'node:path';

import { testProjectPath } from './variables';

const sfdxProjectJson =
	'{"packageDirectories": [{"path": "force-app","default": true}],"name": "TestOrg","namespace": "","sfdcLoginUrl": "https://login.salesforce.com","sourceApiVersion": "58.0"}';

export function creatEnv() {
	// eslint-disable-next-line import/namespace
	if (!fs.existsSync(testProjectPath)) fs.mkdirSync(testProjectPath);

	fs.emptyDirSync(testProjectPath);

	fs.writeFile(path.join(testProjectPath, 'sfdx-project.json'), sfdxProjectJson);

	process.chdir(testProjectPath);
}

export function deleteTestOrg() {
	// eslint-disable-next-line import/namespace
	if (fs.existsSync(testProjectPath)) fs.unlinkSync(testProjectPath);
}
