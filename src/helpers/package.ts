import * as Fs from 'fs-extra'
import {json} from 'stream/consumers'
import convert from 'xml-js'

type ManifestPackage = {
  xml: {attributes: {version: '1.0'}}
  Package: {
    types: Array<ManifestType>
  }
}

type ManifestType = {
  members: Array<string>
  name: string
}

export class PackageController {
  public file = {
    xml: {
      _attributes: {encoding: 'UTF-8', standalone: 'yes', version: '1.0'},
    },
    Package: {
      types: [],
      version: '58.0',
    },
  }

  public members: Map<string, Set<string>> = new Map<string, Set<string>>()

  public addMemberItem(metadataName: string, metadataItem: string) {
    if (!this.members.has(metadataName)) {
      this.members.set(metadataName, new Set<string>())
    }

    this.members.get(metadataName)?.add(metadataItem)
  }

  public concatFile(filePath: string) {
    let rawFile = {}

    try {
      rawFile = JSON.parse(convert.xml2json(Fs.readFileSync(filePath, 'utf8'), {compact: true, spaces: 4}))
    } catch (error) {
      return
    }

    if (!rawFile.Package) rawFile.Package = {}
    if (!rawFile.Package.types) rawFile.Package.types = []

    if (!Array.isArray(rawFile.Package.types)) {
      rawFile.Package.types = [rawFile.Package?.types]
    }

    for (const typeItem of rawFile.Package.types) {
      if (!Array.isArray(typeItem.members) || !typeItem.members) typeItem.members = [typeItem.members]

      for (const memberItem of typeItem.members) {
        this.addMemberItem(typeItem.name._text, memberItem._text)
      }
    }
  }

  public parseToFile() {
    const xmlFile: ManifestPackage = {
      Package: {
        types: [],
      },
    }

    for (const metadataName of [...this.members.keys()].sort()) {
      const pkgType = {
        members: [],
        name: metadataName,
      }

      let memberItens: Array<string> = [...this.members.get(metadataName)]
      pkgType.members = memberItens.sort()

      this.file.Package.types.push(pkgType)
    }

    return convert.json2xml(this.file, {compact: true, spaces: 4})
  }
}

export function xml2json(filePath: string) {
  const packageFile = new PackageController()

  const result = JSON.parse(convert.xml2json(Fs.readFileSync(filePath, 'utf8'), {compact: true, spaces: 4}))

  if (!Array.isArray(result.Package?.types)) result.Package.types = [result.Package?.types]

  for (const typeItem of result.Package.types) {
    if (!Array.isArray(typeItem.members)) typeItem.members = [typeItem.members]

    for (const memberItem of typeItem.members) {
      packageFile.addMemberItem(typeItem.name._text, memberItem._text)
    }
  }

  return packageFile
}
