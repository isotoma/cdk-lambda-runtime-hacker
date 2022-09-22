module.exports = {
    roots: ['<rootDir>/test'],
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    collectCoverage: true,
    coverageThreshold: {
        global: {
            statements: 80,
            branches: 80,
            functions: 80,
            lines: 80,
        },
    },
};
