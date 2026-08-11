module.exports = {
  testEnvironment: "jsdom",

  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "babel-jest",
  },

  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],

  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],

  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)",
  ],

  clearMocks: true,

  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/main.tsx",
    "!src/vite-env.d.ts",
    "!src/**/index.{ts,tsx}",
  ],
};