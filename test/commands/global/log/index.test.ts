import {expect, test} from '@oclif/test'

describe('global/log/index', () => {
  test
  .stdout()
  .command(['global/log/index'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['global/log/index', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
