module.exports = {
    transform: { '^.+\\.ts?$': 'ts-jest' },
    testEnvironment: 'node',
    testRegex: '/tests/.*\\.test\\.ts$',
    moduleFileExtensions: [ 'js', 'ts' ]
}
