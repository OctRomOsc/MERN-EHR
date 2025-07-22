/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
// export default {
  preset: 'ts-jest',
  testEnvironment: "jsdom",
  testTimeout: 30000,
  
  transform: {
    "^.+\.tsx?$": ["ts-jest",{ tsconfig: 'tsconfig.app.json' }], //extra backslash for mjs vs cjs
  },
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy', // Handle style imports
    '\\.(svg)$': '<rootDir>/src/__mocks__/svgMock.js', // Mock SVG imports
  },
  collectCoverage: true, // Optional: Enables coverage reporting
};