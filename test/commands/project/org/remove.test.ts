import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('project:org:remove', () => {
  it('runs project:org:remove cmd', async () => {
    const {stdout} = await runCommand('project:org:remove')
    expect(stdout).to.contain('hello world')
  })

  it('runs project:org:remove --name oclif', async () => {
    const {stdout} = await runCommand('project:org:remove --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
