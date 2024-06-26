import color from 'colors-cli';

export function printTitle(text: string) {
	const message = ` > ${text}`;

	console.log('\n' + color.black(color.white_b(`${message}`)));
}

export function printJson(jsonVariable: any, deep: number = 0) {
	let response = '';
	const spacer = ' '.repeat(deep);

	if (jsonVariable !== undefined && jsonVariable !== null) {
		const keys = Object.keys(jsonVariable).sort();

		const objectKeys = keys.filter((i) => typeof jsonVariable[i] === 'object');
		const variableKeys = keys.filter((i) => typeof jsonVariable[i] !== 'object');

		for (const key of [...variableKeys, ...objectKeys]) {
			if (typeof jsonVariable[key] === 'object') {
				response += `├─ ${spacer}${color.bold(key)}: `;

				if (jsonVariable[key] === undefined || jsonVariable[key] === null) response += jsonVariable[key];

				response += '\n';

				response += printJson(jsonVariable[key], deep + 1);
			} else {
				let dataValue = jsonVariable[key];

				switch (typeof dataValue) {
					case 'boolean': {
						dataValue = color.red(String(dataValue));
						break;
					}

					case 'string': {
						dataValue = color.underline(color.yellow(`"${String(dataValue)}"`));
						break;
					}

					default: {
						dataValue = String(dataValue);
					}
				}

				response += `${deep === 0 ? '├─' : '│'}${spacer} ${deep === 0 ? '' : '├─'}${key}: ${dataValue}\n`;
			}
		}
	}

	return response;
}
