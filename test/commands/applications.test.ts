import { expect, test } from '@oclif/test'

describe('hooks', () => {
  test
    .stdout()
    .hook('prerun', { id: 'noc' })
    .do(output => expect(output.stdout).to.be.itself)
    .it('shows a message')
})
