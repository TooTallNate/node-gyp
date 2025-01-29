#!/usr/bin/env node

'use strict'

process.title = 'node-gyp'

const gyp = require('../')
const log = require('../lib/log')
const os = require('os')

/**
 * Create node-gyp instance and global state
 */
const prog = gyp()
let completed = false
let init = false

function errorMessage () {
  // copied from npm's lib/utils/error-handler.js
  log.error('System', os.type() + ' ' + os.release())
  log.error('command', process.argv.map(JSON.stringify).join(' '))
  log.error('cwd', process.cwd())
  log.error('node -v', process.version)
  log.error('node-gyp -v', 'v' + prog.package.version)
}

function issueMessage () {
  log.error('', [
    'Node-gyp failed to build your package.',
    'Try to update npm and/or node-gyp and if it does not help file an issue with the package author.'
  ].join('\n'))
}

process.on('exit', function (code) {
  if (!completed && !code) {
    log.error('Completion callback never invoked!')
    errorMessage()
    issueMessage()
    process.exit(6)
  }
})

process.on('uncaughtException', function (err) {
  log.error('UNCAUGHT EXCEPTION')
  log.error('stack', err.stack)
  errorMessage()
  issueMessage()
  process.exit(7)
})

function exitError (err) {
  log.error('stack', err.stack)
  errorMessage()
  log.error('not ok')
  process.exit(1)
}

async function runInit () {
  prog.parseArgv(process.argv)
  prog.devDir = prog.opts.devdir

  const homeDir = os.homedir()
  if (prog.devDir) {
    prog.devDir = prog.devDir.replace(/^~/, homeDir)
  } else if (homeDir) {
    const { default: envPaths } = await import('env-paths')
    prog.devDir = envPaths('node-gyp', { suffix: '' }).cache
  } else {
    throw new Error(
      "node-gyp requires that the user's home directory is specified " +
        'in either of the environmental variables HOME or USERPROFILE. ' +
        'Overide with: --devdir /path/to/.node-gyp'
    )
  }

  if (prog.todo.length === 0) {
    if (~process.argv.indexOf('-v') || ~process.argv.indexOf('--version')) {
      log.stdout('v%s', prog.version)
    } else {
      log.stdout('%s', prog.usage())
    }
    process.exit(0)
  }

  log.info('it worked if it ends with', 'ok')
  log.verbose('cli', process.argv)
  log.info('using', 'node-gyp@%s', prog.version)
  log.info('using', 'node@%s | %s | %s', process.versions.node, process.platform, process.arch)

  /**
   * Change dir if -C/--directory was passed.
   */
  const dir = prog.opts.directory
  if (dir) {
    const fs = require('fs/promises')
    try {
      const stat = await fs.stat(dir)
      if (stat.isDirectory()) {
        log.info('chdir', dir)
        process.chdir(dir)
      } else {
        log.warn('chdir', dir + ' is not a directory')
      }
    } catch (e) {
      if (e.code === 'ENOENT') {
        log.warn('chdir', dir + ' is not a directory')
      } else {
        log.warn('chdir', 'error during chdir() "%s"', e.message)
      }
    }
  }
}

async function run () {
  if (!init) {
    init = true
    try {
      await runInit()
    } catch (err) {
      exitError(err)
      return
    }
  }

  const command = prog.todo.shift()
  if (!command) {
    // done!
    completed = true
    log.info('ok')
    return
  }

  try {
    const args = await prog.commands[command.name](command.args) ?? []

    if (command.name === 'list') {
      if (args.length) {
        args.forEach((version) => log.stdout(version))
      } else {
        log.stdout('No node development files installed. Use `node-gyp install` to install a version.')
      }
    } else if (args.length >= 1) {
      log.stdout(...args.slice(1))
    }

    // now run the next command in the queue
    await run()
  } catch (err) {
    log.error(command.name + ' error')
    exitError(err)
  }
}

// start running the given commands!
run()
