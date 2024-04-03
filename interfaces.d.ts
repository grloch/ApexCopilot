export namespace ProjectConfigOptions {
  // TODO CONFIG LOGS AND USE OPTION!
  export type ProjectConfing = {
    logs?: {
      path: string
      save?: boolean
    }
    manifest: {
      mergedPath: string
      path: string
    }
    package: {
      fullManifestPath: boolean
      path: string
      timestamp: boolean
    }
  }
}

export namespace NumbersTypes {
  type EnumNumberRange<N extends number, Acc extends number[] = []> = Acc['length'] extends N ? Acc[number] : EnumNumberRange<N, [...Acc, Acc['length']]>

  export type IntRange<F extends number, T extends number> = Exclude<EnumNumberRange<T>, EnumNumberRange<F>>
}
