import select from '@inquirer/select';

export async function confirm(message: string, options?: { labels?: { cancel?: string; confirm?: string } }) {
	options = options ?? { labels: {} };

	let { labels } = options ?? { labels: {} };
	if (!labels) labels = {};

	labels.confirm = labels.confirm ?? 'Confirm';
	labels.cancel = labels.cancel ?? 'Cancel';

	return select({
		choices: [
			{ name: labels.confirm, value: true },
			{ name: labels.cancel, value: false },
		],
		message,
	});
}
