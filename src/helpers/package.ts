import * as Fs from 'fs';
import convert from 'xml-js';

import defaultLogger from './logger';

type ManifestPackage = {
	Package: {
		types: Array<ManifestType>;
	};
	xml: { attributes: { version: '1.0' } };
};

type XmlProprety = {
	_text: string;
};

type ManifestType = {
	members: Array<XmlProprety | string>;
	name: XmlProprety | string;
};

export class PackageController {
	public file = {
		Package: {
			types: [],
			version: '58.0',
		},
		xml: {
			_attributes: {
				encoding: 'UTF-8',
				standalone: 'yes',
				version: '1.0',
			},
		},
	};

	public members: Map<string, Set<string>> = new Map<string, Set<string>>();

	get hasItens() {
		return [...this.members.values()].flat().length > 0;
	}

	get membersNames() {
		return this.members.keys();
	}

	public addMemberItem(metadataName: string, metadataItem: string) {
		if (!this.members.has(metadataName)) {
			this.members.set(metadataName, new Set<string>());
		}

		this.members.get(metadataName)?.add(metadataItem);
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
				if (!Array.isArray(typeItem.members) || !typeItem.members) typeItem.members = [typeItem.members];

				for (const memberItem of typeItem.members) {
					this.addMemberItem(typeItem.name._text, memberItem._text);
				}
			}
		}
	}

	public parseToFile() {
		const xmlFile: ManifestPackage = {
			Package: {
				types: [],
			},
		};

		for (const metadataName of [...this.members.keys()].sort()) {
			const pkgType = {
				members: [],
				name: metadataName,
			};

			let memberItens: Array<string> = [...this.members.get(metadataName)];
			pkgType.members = memberItens.sort();

			this.file.Package.types.push(pkgType);
		}

		return convert.json2xml(this.file, { compact: true, spaces: 4 });
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
