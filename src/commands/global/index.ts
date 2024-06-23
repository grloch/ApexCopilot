import { Args, CommandHelp } from '@oclif/core';

export default class GlobalIndex extends CommandHelp {
	static args = {
		commands: Args.string({ description: 'Command to show help for.', required: false }),
	};

	static description = 'Genereal CLI configs';
}
