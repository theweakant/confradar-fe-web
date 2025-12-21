// /** @type {import('ts-jest').JestConfigWithTsJest} */
// module.exports = {
//     // preset: 'ts-jest',
//     preset: 'ts-jest/presets/js-with-ts',
//     testEnvironment: 'jsdom',
//     globals: {
//         'ts-jest': {
//             tsconfig: 'tsconfig.jest.json'
//         }
//     },
//     transform: {
//         '^.+\\.(ts|tsx)$': 'ts-jest',
//     },
//     moduleNameMapper: {
//         '^@/(.*)$': '<rootDir>/src/$1',
//         '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
//     },
//     setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
//     testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
// };

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest/presets/js-with-ts',
    testEnvironment: 'jsdom',
    
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            tsconfig: 'tsconfig.jest.json'
        }],
    },
    
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    
    testPathIgnorePatterns: [
        '<rootDir>/.next/', 
        '<rootDir>/node_modules/'
    ],
    
    transformIgnorePatterns: [
        'node_modules/(?!(@fullcalendar|preact|@reduxjs)/)',
    ],
    
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    
    modulePathIgnorePatterns: ['<rootDir>/.next/'],
};