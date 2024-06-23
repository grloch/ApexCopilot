import { checkbox, select } from '@inquirer/prompts';
import { ChoiceBase } from 'inquirer';
import * as minimatch from 'minimatch';
import * as fs from 'node:fs';
import * as path from 'node:path';

import defaultLogger from '../logger';

interface CheckboxOption extends ChoiceBase {
	disabled?: boolean;
	isDirectory: boolean;
	name: string;
	value: string;
}

interface SelectFileOrDirPathOptions {
	filter?: Array<string> | string;
	ignoreGlob?: Array<string>;
	minimumSelection?: number;
}

interface ListFilesAsTreeOptions extends SelectFileOrDirPathOptions {
	depth?: number;
	filter?: Array<string> | string;
}

function sortMethod(a: fs.Dirent, b: fs.Dirent): number {
	const aIsFile = a.isFile();
	const bIsFile = b.isFile();

	if (aIsFile && !bIsFile) return -1;

	if (bIsFile && !aIsFile) return 1;

	return 0;
}

function filterMethod(file: fs.Dirent, allowedExtensions?: Array<string> | string): boolean {
	if (!allowedExtensions) allowedExtensions = [];
	else if (!Array.isArray(allowedExtensions)) allowedExtensions = [allowedExtensions];

	if (file.isDirectory() || !allowedExtensions || allowedExtensions.length === 0) return true;

	const fileExtension = path.extname(file.name);

	return allowedExtensions.includes(fileExtension) || allowedExtensions.includes(fileExtension.replace('.', ''));
}

function listFilesAsTree(dir: string, options?: ListFilesAsTreeOptions): Array<CheckboxOption> {
	if (!options) options = { depth: 0 };
	if (!options.depth) options.depth = 0;

	const { depth, filter, ignoreGlob } = options;

	const stats = fs.lstatSync(dir);
	const response: Array<CheckboxOption> = [];

	let filterPath = false;

	if (ignoreGlob && ignoreGlob.length > 0) {
		for (const globItem of ignoreGlob) {
			if (minimatch.match([dir], globItem)) {
				filterPath = true;
				break;
			}
		}
	}

	if (filterPath) return [];

	if (stats.isDirectory()) {
		const name = `${' '.repeat(depth)}${path.basename(dir)}`;
		const children = fs
			.readdirSync(dir, { withFileTypes: true })
			.sort(sortMethod)
			.filter((i) => filterMethod(i, filter))
			.map((i) => path.join(i.name))
			.map((child) => listFilesAsTree(path.join(dir, child), { ...options, depth: depth + 1 }))
			.filter((child) => child.length > 0)
			.flat();

		if (children.length > 0) {
			response.push(
				{
					disabled: true,
					isDirectory: true,
					name,
					value: dir,
				},
				...children,
			);
		}
	} else {
		const name = `${' '.repeat(depth)}- ${path.basename(dir)}`;

		response.push({
			disabled: false,
			isDirectory: false,
			name,
			value: dir,
		});
	}

	return response;
}

export default async function selectFileOrDirPath(message: string, rootDir: string, options?: SelectFileOrDirPathOptions): Promise<string[]> {
	if (!options) options = {};
	if (!options.minimumSelection || options.minimumSelection < 0) options.minimumSelection = 1;

	const { filter, ignoreGlob, minimumSelection } = options;

	const choices = listFilesAsTree(rootDir, { filter, ignoreGlob });

	if (choices.length === 0) {
		let errorMessage = `Didn't founded any valid file at ${rootDir}`;

		if (filter && filter.length > 0) {
			errorMessage += `Valid types: `;
			errorMessage += Array.isArray(filter) ? filter.join(', ') : filter;
		}

		defaultLogger.error(errorMessage, 'EXCEPTION');
	}

	const promptArgs = {
		choices: [...choices],
		message,
		name: 'files',
		pageSize: 20,
		validate,
	};

	const response = minimumSelection > 1 ? await checkbox(promptArgs) : await select(promptArgs);

	return response;

	function validate(response) {
		let errorMessage = '';

		if (response.length < minimumSelection) {
			errorMessage += `Select at least ${minimumSelection} file${minimumSelection > 1 ? 's' : ''} from ${rootDir}. `;

			if (filter && filter.length > 0) {
				errorMessage += `Valid types: `;
				errorMessage += Array.isArray(filter) ? filter.join(', ') : filter;
			}
		}

		if (errorMessage !== '') return errorMessage.trim();

		return true;
	}
}
