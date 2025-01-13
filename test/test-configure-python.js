'use strict'

const { describe, it } = require('mocha')
const assert = require('assert')
const path = require('path')
const { devDir: getDevDir } = require('./common')
const gyp = require('../lib/node-gyp')
const requireInject = require('require-inject')

const configure = requireInject('../lib/configure', {
  'graceful-fs': {
    openSync: () => 0,
    closeSync: () => {},
    existsSync: () => {},
    promises: {
      stat: async () => ({}),
      mkdir: async () => {},
      writeFile: async () => {}
    }
  }
})

const EXPECTED_PYPATH = path.join(__dirname, '..', 'gyp', 'pylib')
const SEPARATOR = process.platform === 'win32' ? ';' : ':'
const SPAWN_RESULT = cb => ({ on: function () { cb() } })

describe('configure-python', async function () {
  const devDir = await getDevDir()

  it('configure PYTHONPATH with no existing env', function (done) {
    delete process.env.PYTHONPATH

    const prog = gyp()
    prog.parseArgv([])
    prog.spawn = function () {
      assert.strictEqual(process.env.PYTHONPATH, EXPECTED_PYPATH)
      return SPAWN_RESULT(done)
    }
    prog.devDir = devDir
    configure(prog, [], assert.fail)
  })

  it('configure PYTHONPATH with existing env of one dir', function (done) {
    const existingPath = path.join('a', 'b')
    process.env.PYTHONPATH = existingPath

    const prog = gyp()
    prog.parseArgv([])
    prog.spawn = function () {
      assert.strictEqual(process.env.PYTHONPATH, [EXPECTED_PYPATH, existingPath].join(SEPARATOR))

      const dirs = process.env.PYTHONPATH.split(SEPARATOR)
      assert.deepStrictEqual(dirs, [EXPECTED_PYPATH, existingPath])

      return SPAWN_RESULT(done)
    }
    prog.devDir = devDir()
    configure(prog, [], assert.fail)
  })

  it('configure PYTHONPATH with existing env of multiple dirs', function (done) {
    const pythonDir1 = path.join('a', 'b')
    const pythonDir2 = path.join('b', 'c')
    const existingPath = [pythonDir1, pythonDir2].join(SEPARATOR)
    process.env.PYTHONPATH = existingPath

    const prog = gyp()
    prog.parseArgv([])
    prog.spawn = function () {
      assert.strictEqual(process.env.PYTHONPATH, [EXPECTED_PYPATH, existingPath].join(SEPARATOR))

      const dirs = process.env.PYTHONPATH.split(SEPARATOR)
      assert.deepStrictEqual(dirs, [EXPECTED_PYPATH, pythonDir1, pythonDir2])

      return SPAWN_RESULT(done)
    }
    prog.devDir = devDir()
    configure(prog, [], assert.fail)
  })
})
