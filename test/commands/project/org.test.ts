import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('project:org', () => {
  it('runs project:org cmd', async () => {
    const {stdout} = await runCommand('project:org')
    expect(stdout).to.contain('hello world')
  })

  it('runs project:org --name oclif', async () => {
    const {stdout} = await runCommand('project:org --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
