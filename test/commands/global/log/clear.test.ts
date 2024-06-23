import { expect, test } from '@oclif/test';

describe('global/log/clear', () => {
	test
		.stdout()
		.command(['global/log/clear'])
		.it('runs hello', (ctx) => {
			expect(ctx.stdout).to.contain('hello world');
		});

	test
		.stdout()
		.command(['global/log/clear', '--name', 'jeff'])
		.it('runs hello --name jeff', (ctx) => {
			expect(ctx.stdout).to.contain('hello jeff');
		});
});
