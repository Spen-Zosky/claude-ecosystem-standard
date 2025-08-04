module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/.src'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.spec.ts'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.node_modules/',
    '/dist/'
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/.node_modules',
    '<rootDir>/node_modules'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/.src/$1'
  },
  collectCoverageFrom: [
    '.src/**/*.ts',
    '!.src/**/*.d.ts',
    '!.src/**/*.test.ts'
  ],
  passWithNoTests: true
};
