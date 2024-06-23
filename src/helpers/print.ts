import color from 'colors-cli';

export function printTitle(text: string) {
	const message = ` > ${text}`;

	console.log('\n' + color.black(color.white_b(`${message}`)));
}

export function printJson(jsonVariable: any, spacer: string = '') {
	const keys = Object.keys(jsonVariable).sort();

	for (const key of keys) {
		if (typeof jsonVariable[key] === 'object') {
			console.log(`|${spacer} ${color.bold(key)}`);
			printJson(jsonVariable[key], spacer + '..|');
		} else {
			let dataValue = jsonVariable[key];

			switch (typeof dataValue) {
				case 'boolean': {
					dataValue = color.red(String(dataValue));
					break;
				}

				case 'string': {
					dataValue = color.underline(color.yellow(String(dataValue)));
					break;
				}
			}

			console.log(`|${spacer}  . ${key}  ${dataValue}`);
		}
	}
}
