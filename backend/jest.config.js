/**
 * Jest Configuration for TBOI Codex Backend
 */
module.exports = {
    testEnvironment: 'node',
    testMatch: [
        '**/*.test.js',
        '**/*.spec.js'
    ],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/server.js'
    ],
    coverageDirectory: 'coverage',
    verbose: true,
    testTimeout: 10000
};
