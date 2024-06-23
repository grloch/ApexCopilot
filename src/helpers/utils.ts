export function prettyNum(num: number) {
	return num < 10 ? `0${num}` : String(num);
}

export function getTimeStamp() {
	const now = new Date();

	const year = String(now.getFullYear());
	const mounth = prettyNum(now.getMonth());
	const day = prettyNum(now.getDate());
	const hour = prettyNum(now.getHours());
	const minute = prettyNum(now.getMinutes());
	const second = prettyNum(now.getSeconds());

	return `${now.getTime()} ${year}-${mounth}-${day} ${hour}:${minute}:${second}`;
}

export function capitalize(txt: string) {
	return txt.charAt(0).toUpperCase() + txt.slice(1);
}

export function mergeJson(target: any, model: any): void {
	for (const key in model) {
		if (model[key]) {
			if (typeof model[key] === 'object' && model[key] !== null) {
				if (!target[key]) target[key] = {};

				mergeJson(target[key], model[key]);
			} else if (target[key] === undefined || target[key] === null) {
				target[key] = model[key];
			}
		}
	}
}
