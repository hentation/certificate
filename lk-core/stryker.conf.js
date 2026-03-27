// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
module.exports = {
  $schema: "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  _comment: "This config was generated using 'stryker init'. Please take a look at: https://stryker-mutator.io/docs/stryker-js/configuration/ for more information",
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress"],
  testRunner: "jest",
  //https://stryker-mutator.io/docs/stryker-js/troubleshooting/#mutants-survive-but-should-be-killed---jest-runner
  coverageAnalysis: "all",
  checkers: ["typescript"],
  tsconfigFile: "tsconfig.json",
  concurrency: 4
}