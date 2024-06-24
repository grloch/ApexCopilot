import { CommandHelp } from '@oclif/core';

export default class HelpCommand extends CommandHelp {
	async run() {
		this._help();
	}
}
