import * as salesforce from '@salesforce/core';
import { AliasAccessor } from '@salesforce/core/lib/stateAggregator/accessors/aliasAccessor';

export async function listDeviceOrgs(): Promise<AliasAccessor> {
	return (await salesforce.StateAggregator.getInstance()).aliases;
}
