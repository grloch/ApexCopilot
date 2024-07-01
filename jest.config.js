/* eslint-disable unicorn/prefer-module */

module.exports = {
	collectCoverage: true,
	coverageDirectory: 'coverage',
	coverageReporters: ['json', 'lcov', 'text', 'clover'],
	moduleFileExtensions: ['ts', 'js', 'json', 'node'],
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
};
