/* eslint-disable unicorn/prefer-module */

module.exports = {
	moduleFileExtensions: ['ts', 'js', 'json', 'node'],
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
};
