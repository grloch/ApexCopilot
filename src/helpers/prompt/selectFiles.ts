import inquirer from '@inquirer/checkbox'
import {globSync} from 'glob'

export default async function selectManifestFiles() {
  const files = globSync('./manifest/**/*.xml', {}).map((i) => ({name: i.replace('manifest\\', ''), value: i}))

  return inquirer({
    choices: [...files],
    message: 'Enter your name',
    required: true,
    validate: (resp) => {
      if (resp.length < 2) {
        return 'Select at least 2 files'
      }

      return true
    },
  })
}
