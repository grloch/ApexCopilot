import * as salesforce from '@salesforce/core';

import { Prompt } from '../../interfaces';

export async function listDeviceOrgsAsSelectOption(): Promise<Array<Prompt.Choice>> {
	const salesforceOrgs = (await salesforce.StateAggregator.getInstance()).aliases.getAll();
	const orgOptions: Array<Prompt.Choice> = [];

	for (const alias in salesforceOrgs) {
		orgOptions.push({
			name: `${alias} - ${salesforceOrgs[alias]}`,
			value: alias,
		});
	}

	return orgOptions;
}

export function removeOrgItemOption(orglistOption: Array<Prompt.Choice>, orgALias: string) {
	if (orglistOption && orgALias !== null && orgALias.length > 0) {
		const index = orglistOption.findIndex((i) => i.value === orgALias);

		orglistOption.splice(index, 1);
	}
}
