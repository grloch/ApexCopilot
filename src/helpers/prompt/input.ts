import * as inquirer from '@inquirer/prompts'

export async function confirm(message: string, options?: {labels?: {cancel?: string; confirm?: string}}) {
  options = options ?? {labels: {}}

  let {labels} = options ?? {labels: {}}
  if (!labels) labels = {}

  labels.confirm = labels.confirm ?? 'Confirm'
  labels.cancel = labels.cancel ?? 'Cancel'

  return inquirer.select({
    choices: [
      {name: labels.confirm, value: true},
      {name: labels.cancel, value: false},
    ],
    message,
  })
}
