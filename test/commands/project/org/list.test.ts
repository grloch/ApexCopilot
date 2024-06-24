import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('project:org:list', () => {
  it('runs project:org:list cmd', async () => {
    const {stdout} = await runCommand('project:org:list')
    expect(stdout).to.contain('hello world')
  })

  it('runs project:org:list --name oclif', async () => {
    const {stdout} = await runCommand('project:org:list --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
