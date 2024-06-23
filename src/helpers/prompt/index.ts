import * as input from './input';
import inquirePath from './inquirePath';
import selectFiles from './select-files';

const exportObject = {
	files: {
		selectFiles,
	},
	input,
	path: {
		inquirePath,
	},
};

export default exportObject;
