type EnumNumberRange<N extends number, Acc extends number[] = []> = Acc['length'] extends N ? Acc[number] : EnumNumberRange<N, [...Acc, Acc['length']]>

export namespace ProjectConfigOptions {
  export type ProjectConfing = {
    logs: {
      path: string | undefined
      save?: boolean
    }
    manifest: {
      mergedPath: string | undefined
      path: string | undefined
    }
    package: {
      fullManifestPath: boolean
      path: string | undefined
      timestamp: boolean
    }
  }
}

export namespace NumbersTypes {
  export type IntRange<F extends number, T extends number> = Exclude<EnumNumberRange<T>, EnumNumberRange<F>>
}

export namespace Logger {
  export type ErrorType = 'ERROR' | 'EXCEPTION'

  export type LogType = 'INFO' | 'LOG' | 'METHOD_RETURN' | 'PROCESS_END' | 'PROCESS_START' | 'WARNING' | ErrorType

  export interface LogOptions {
    context?: string
    message: string
    prompt?: boolean
    throwError?: boolean
    type?: LogType
  }
}
