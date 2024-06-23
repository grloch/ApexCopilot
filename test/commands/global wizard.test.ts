import { expect, test } from '@oclif/test';

describe('global wizard', () => {
	test
		.stdout()
		.command(['global wizard'])
		.it('runs hello', (ctx) => {
			expect(ctx.stdout).to.contain('hello world');
		});

	test
		.stdout()
		.command(['global wizard', '--name', 'jeff'])
		.it('runs hello --name jeff', (ctx) => {
			expect(ctx.stdout).to.contain('hello jeff');
		});
});
