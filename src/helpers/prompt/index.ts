import * as input from './input';
import inquirePath from './inquire-path';
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
