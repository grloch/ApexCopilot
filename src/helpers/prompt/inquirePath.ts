import * as inquirer from '@inquirer/prompts';

import { NumbersTypes } from '../../../interfaces';
import defaultLogger from '../logger';
import path from 'node:path';

type InquirePathOptions = {
	default?: string;
	fileType?: string;
	maximumTrys?: NumbersTypes.IntRange<1, 10>;
	message: string;
	type?: 'dir' | 'file';
};

export default async function inquirePath(options: InquirePathOptions) {
	const logger = defaultLogger.buildLogContext('helpers/prompt/inquirePath', 'inquirePath');

	options.maximumTrys = options.maximumTrys ?? 5;
	let avaliableTrys = options.maximumTrys;
	let inquireResponse: string = ' ';

	/* eslint-disable no-await-in-loop */
	do {
		if (avaliableTrys !== options.maximumTrys) {
			logger.error(`"${inquireResponse} isn't a valid path`, 'ERROR');
		}

		avaliableTrys--;

		inquireResponse = await inquirer.input({ ...options });

		if (!inquireResponse) {
			logger.error(`Invalid response, inform a valid dir path: (${inquireResponse})`, 'ERROR');
		}

		if (!inquireResponse && avaliableTrys <= 0) {
			logger.error(`No valid response was given`, 'EXCEPTION');
		}
	} while (avaliableTrys && !inquireResponse);

	if (!inquireResponse.startsWith(`./`) && !inquireResponse.startsWith(path.sep)) {
		inquireResponse = `./${inquireResponse}`;
	}

	logger.methodResponse(inquireResponse, true, options.message);

	return inquireResponse;
}
