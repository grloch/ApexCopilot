import promptSelection from '@inquirer/select';

import { Prompt } from '../../../interfaces';

export async function confirm(message: string, options?: { labels?: { cancel?: string; confirm?: string } }) {
	options = options ?? { labels: {} };

	let { labels } = options ?? { labels: {} };
	if (!labels) labels = {};

	labels.confirm = labels.confirm ?? 'Confirm';
	labels.cancel = labels.cancel ?? 'Cancel';

	return promptSelection({
		choices: [
			{ name: labels.confirm, value: true },
			{ name: labels.cancel, value: false },
		],
		message,
	});
}

export async function select(message: string, options: { choices: Array<Prompt.Choice> }) {
	return promptSelection({
		choices: options.choices,
		message,
	});
}
