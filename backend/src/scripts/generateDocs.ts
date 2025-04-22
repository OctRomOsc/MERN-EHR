import { generateTspec, Tspec } from 'tspec';

const options: Tspec.GenerateParams = {
  specPathGlobs: ['src/**/*.ts'],
  tsconfigPath: '../tsconfig.json',
  outputPath: '../docs/openapi.json',
  specVersion: 3,
  openapi: {
    title: 'Tspec API',
    version: '0.0.1',
    description: "This is Tspec API",
  },
  debug: false,
  ignoreErrors: true,
};

const openApiSpec = generateTspec(options);