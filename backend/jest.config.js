/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  testTimeout: 10000,
  transform: {
    "^.+\.tsx?$": ["ts-jest",{}],
  },
};