import * as inquirer from '@inquirer/prompts'

import {NumbersTypes} from '../../../interfaces'
import defaultLogger from '../logger'

type InquirePathOptions = {
  default?: string
  fileType?: string
  maximumTrys?: NumbersTypes.IntRange<1, 10>
  message: string
  type?: 'dir' | 'file'
}

export default async function inquirePath(options: InquirePathOptions) {
  const logger = defaultLogger.buildLogContext('helpers/prompt/inquirePath', 'inquirePath')

  options.maximumTrys = options.maximumTrys ?? 5
  let avaliableTrys = options.maximumTrys
  let inquireResponse: string = ' '

  /* eslint-disable no-await-in-loop */
  do {
    if (avaliableTrys !== options.maximumTrys) {
      logger.error(`"${inquireResponse} isn't a valid path`, 'ERROR')
    }

    avaliableTrys--

    inquireResponse = await inquirer.input({...options})

    if (!inquireResponse) {
      logger.error(`Invalid response, inform a valid dir path: (${inquireResponse})`, 'ERROR')
    }

    if (!inquireResponse && avaliableTrys <= 0) {
      logger.error(`No valid response was given`, 'EXCEPTION')
    }
  } while (avaliableTrys && !inquireResponse)

  logger.methodResponse(inquireResponse, true, options.message)

  return inquireResponse
}

// type selectFileOrDirPath_selectFileOptions = {
//
//   filter?: Set<string>
//   minimunSelection?: number
//   multiple?: boolean
//   rootPath: string
//   type: 'dir' | 'file'
// }

//   message: options.message,
//   //     multiple: options.multiple,
//       name: 'resp',
//   //     root: options.rootPath,
//   //     // @ts-expect-error Valid type created by importing "inquirer-file-tree-selection-prompt"
//   //     type: 'fileTreeSelection',
//   //     // validate,
// })

// response = resp
// // } while (
// //   avaliableTrys > 0 &&
// //   (!response || (options.multiple && (!Array.isArray(response) || (options.minimunSelection && response.length < options.minimunSelection))))
// // )

// // // logger.methodResponse({context: LOG_CONTEXT, methodName: 'selectFileOrDirPath', methodResponse: response})

// return response
