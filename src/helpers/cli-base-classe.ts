import { Command } from '@oclif/core';

import { ProjectConfigOptions } from '../../interfaces';
import * as cliDefaultConfigs from './cli-config';
import logger from './logger';

export default abstract class Base extends Command {
	private projectConfig: ProjectConfigOptions.ProjectConfing = cliDefaultConfigs.getConfig();
	private logger = logger;

	abstract handleFlags(flags: any): Promise<void>;
}
