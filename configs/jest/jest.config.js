'use strict';
module.exports = {
    globals: {
        crypto: require('crypto'),
    },
    roots: ['<rootDir>/src'],
    rootDir: '../..',
    setupFiles: [
        'react-app-polyfill/jsdom',
        'jest-canvas-mock',
        '<rootDir>/configs/jest/metaos-mock.js',
        '<rootDir>/configs/jest/app-initializations.ts',
    ],
    setupFilesAfterEnv: ['<rootDir>/configs/jest/setup-enzyme.ts'],
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
    ],
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.(js|jsx|mjs|cjs|ts|tsx)$': 'babel-jest',
        '^.+\\.css$': '<rootDir>/configs/jest/cssTransform.js',
        '^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|json)$)':
            '<rootDir>/configs/jest/fileTransform.js',
    },
    modulePaths: ['<rootDir>/src'],
    moduleNameMapper: {
        '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
        '^lodash-es': 'lodash',
    },
    moduleFileExtensions: [
        'web.js',
        'js',
        'web.ts',
        'ts',
        'web.tsx',
        'tsx',
        'json',
        'web.jsx',
        'jsx',
        'node',
    ],
    watchPlugins: [
        'jest-watch-typeahead/filename',
        'jest-watch-typeahead/testname',
    ],
    resetMocks: false,
    coverageReporters: ['text', 'lcov', 'json', 'cobertura'],
    coveragePathIgnorePatterns: [
        '.styles.(js|jsx|ts|tsx)',
        '.style.(js|jsx|ts|tsx)',
        'config/jest/setupTests.ts',
        'src/icons/',
        'src/shared/styles/',
        'src/images/',
        'public/',
        '.scss',
        '.mock.(js|jsx|ts|tsx)',
    ],
    coverageThreshold: {
        // TODO: reintroduce threshold for coverage checks
        // global: {
        //     functions: 60,
        //     lines: 70,
        //     statements: 70,
        // },
    },
};
