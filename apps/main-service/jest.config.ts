export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  setupFilesAfterEnv: ['./src/tests/setup.ts'],
  moduleNameMapper: {
    '^uuid$': '<rootDir>/src/tests/mocks/uuid.mock.ts',
    '^@ocj/constants$': '<rootDir>/../../packages/constants/src/index.ts',
    '^@ocj/errors$': '<rootDir>/../../packages/errors/src/index.ts',
    '^@ocj/executor$': '<rootDir>/../../packages/executor/src/index.ts',
    '^@ocj/utils$': '<rootDir>/../../packages/utils/src/index.ts',
    '^@ocj/validators$': '<rootDir>/../../packages/validators/src/index.ts',
  },
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
