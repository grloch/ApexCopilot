const isInTest = typeof global.it === 'function';

export const LOGGER_DEBUG = !isInTest && process.env.NODE_ENV !== 'production';
