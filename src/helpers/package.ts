import * as Fs from 'fs';
import convert from 'xml-js';

import * as cliDefaultConfigs from '../helpers/cli-config';
import defaultLogger from './logger';
import { CaseInsensitiveMap } from './map';
import { ProjectConfigOptions } from '../../interfaces';

type ManifestPackage = {
	xml: { attributes: { version: '1.0' } };
	Package: {
		types: Array<ManifestType>;
	};
};

type XmlProprety = {
	_text: string;
};

type ManifestType = {
	members: Array<XmlProprety | string>;
	name: XmlProprety | string;
};

const projectConfig: ProjectConfigOptions.ProjectConfing = cliDefaultConfigs.getConfig();

export class PackageController {
	public file = {
		xml: {
			_attributes: {
				encoding: 'UTF-8',
				standalone: 'yes',
				version: '1.0',
			},
		},
		Package: {
			types: new Array<{ members: Array<string>; name: string }>(),
			version: projectConfig.salesforceApi,
		},
	};

	public members: CaseInsensitiveMap<string, Set<string>> = new CaseInsensitiveMap<string, Set<string>>();

	get hasItens() {
		return [...this.members.values()].flat().length > 0;
	}

	get membersNames() {
		return [...(this.members.keys() ?? [])].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
	}

	public addMemberItem(metadataName: string, metadataItem: string) {
		if (metadataName && metadataName.length > 0 && metadataItem && metadataItem.length > 0) {
			metadataName = metadataName.trim();
			metadataItem = metadataItem.trim();

			if (!this.members.has(metadataName)) {
				this.members.set(metadataName, new Set<string>());
			}

			const member = this.members.get(metadataName);

			if (member && !member.has('*')) {
				if (metadataItem === '*') {
					this.members.set(metadataName, new Set<string>('*'));
				} else if (member) {
					member.add(metadataItem);
				}
			}
		}
	}

	public buildFile() {
		const membersName = [...this.members.keys()].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

		for (const metadataName of membersName) {
			const memberItens = this.members.get(metadataName);

			if (memberItens && memberItens.size > 0) {
				const pkgType = {
					members: [...memberItens].sort(),
					name: metadataName,
				};

				if (pkgType.members.includes('*')) pkgType.members = ['*'];
				if (pkgType.members.length === 0) continue;
				this.file.Package.types.push(pkgType);
			}
		}

		return convert.json2xml(JSON.stringify(this.file), { compact: true, spaces: 4 });
	}

	public concatFile(filePaths: Array<string> | string) {
		if (!filePaths) filePaths = [];
		else if (!Array.isArray(filePaths)) filePaths = [filePaths];

		for (const file of filePaths) {
			if (!Fs.existsSync(file)) {
				defaultLogger.error(`${file} isn't a valid path or not founded`, 'EXCEPTION');
			}

			let rawFile: ManifestPackage = {
				Package: { types: [] },
				xml: { attributes: { version: '1.0' } },
			};

			try {
				rawFile = JSON.parse(convert.xml2json(Fs.readFileSync(file, 'utf8'), { compact: true, spaces: 4 }));
			} catch (error) {
				return defaultLogger.error(`Error parsing file "${file}": ${error}`, 'EXCEPTION');
			}

			if (!Array.isArray(rawFile.Package.types)) {
				rawFile.Package.types = [rawFile.Package?.types];
			}

			for (const typeItem of rawFile.Package.types) {
				// @ts-expect-error: it's ok
				if (!Array.isArray(typeItem.members) || !typeItem.members) typeItem.members = [typeItem.members];

				for (const memberItem of typeItem.members) {
					// @ts-expect-error: it's ok
					this.addMemberItem(typeItem.name?._text, memberItem?._text);
				}
			}
		}
	}

	public getMemberItens(memberName: string) {
		return this.members.get(memberName) ?? new Set<string>();
	}
}

export function xml2json(filePath: string) {
	const packageFile = new PackageController();

	const result = JSON.parse(convert.xml2json(Fs.readFileSync(filePath, 'utf8'), { compact: true, spaces: 4 }));

	if (!Array.isArray(result.Package?.types)) result.Package.types = [result.Package?.types];

	for (const typeItem of result.Package.types) {
		if (!Array.isArray(typeItem.members)) typeItem.members = [typeItem.members];

		for (const memberItem of typeItem.members) {
			packageFile.addMemberItem(typeItem.name._text, memberItem._text);
		}
	}

	return packageFile;
}
