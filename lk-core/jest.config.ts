import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
    preset: "ts-jest",
    testEnvironment: "node",
    modulePathIgnorePatterns: [
        "dist",
    ],
    // Два костыля снизу нужны, чтобы импорты внутри приложения работали без необходимости их делать относительными
    rootDir: ".",
    modulePaths: ["<rootDir>"],
    maxWorkers: 4,
    errorOnDeprecated: true,
    coverageDirectory: "reports/coverage",

    testTimeout: 30_000,
};
export default config;
