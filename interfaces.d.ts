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

export namespace Logger {
  type ErrorType = 'ERROR' | 'EXCEPTION'

  type LogType = 'INFO' | 'LOG' | 'METHOD_RETURN' | 'PROCESS_END' | 'PROCESS_START' | 'WARNING' | ErrorType

  type LogOptions = {
    context?: string
    message: string
    prompt?: boolean
    throwError?: boolean
    type?: LogType
  }
}
