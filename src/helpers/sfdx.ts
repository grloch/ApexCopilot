import * as salesforce from '@salesforce/core';

import { Prompt } from '../../interfaces';

export interface PromptChoiceArray extends Array<Prompt.Choice> {
	removeItem(itemvalue: string): void;
}

export async function listDeviceOrgsAsSelectOption(): Promise<PromptChoiceArray> {
	const salesforceOrgs = (await salesforce.StateAggregator.getInstance()).aliases.getAll();
	const orgOptions: PromptChoiceArray = [];

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
