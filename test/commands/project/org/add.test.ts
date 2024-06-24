import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('project:org:add', () => {
  it('runs project:org:add cmd', async () => {
    const {stdout} = await runCommand('project:org:add')
    expect(stdout).to.contain('hello world')
  })

  it('runs project:org:add --name oclif', async () => {
    const {stdout} = await runCommand('project:org:add --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
