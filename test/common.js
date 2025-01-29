const semver = require('semver')

module.exports.devDir = async () => {
  const { default: envPaths } = await import('env-paths')
  return envPaths('node-gyp', { suffix: '' }).cache
}

module.exports.poison = (object, property) => {
  function fail () {
    console.error(Error(`Property ${property} should not have been accessed.`))
    process.abort()
  }
  const descriptor = {
    configurable: false,
    enumerable: false,
    get: fail,
    set: fail
  }
  Object.defineProperty(object, property, descriptor)
}

// Only run full test suite when instructed and on a non-prerelease version of node
module.exports.FULL_TEST =
  process.env.FULL_TEST === '1' &&
  process.release.name === 'node' &&
  semver.prerelease(process.version) === null

module.exports.platformTimeout = (def, obj) => {
  for (const [key, value] of Object.entries(obj)) {
    if (process.platform === key) {
      return value * 60 * 1000
    }
  }
  return def * 60 * 1000
}
