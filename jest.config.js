const {defaults} = require('jest-config');
module.exports = {  
  testPathIgnorePatterns: ["<rootDir>/node_modules/"],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  moduleNameMapper: {    
    "Controllers/(.*)$": "<rootDir>/src/controllers/$1",
    "Repositories/(.*)$": "<rootDir>/src/repositories/$1",
    "Models/(.*)$": "<rootDir>/src/models/$1",
    "Helpers/(.*)$": "<rootDir>/src/helpers/$1",
  },  
};
