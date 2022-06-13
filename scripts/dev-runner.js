const path = require('path')
const chalk = require('chalk')
const electron = require('electron')
const { spawn } = require('child_process')
const { createServer, createLogger, build } = require('vite')
const { MAIN_ROOT, MAIN_PRELOAD_ROOT, RENDERER_ROOT } = require('./constants')

let manualRestart
let electronProcess 

async function startRenderer() {
  try {
    const viteServer = await createServer({
      root: RENDERER_ROOT
    })
    await viteServer.listen()
    return viteServer
  } catch (error) {
    createLogger().error(
      chalk.red(`error when starting dev server:\n${error.stack}`)
    )
  }
}

async function watchMainProcess(root) {
  try {
    const rollupWatcher = await build({
      root,
      mode: 'development',
      build: {
        emptyOutDir: false,
        outDir: path.resolve(__dirname, '../dist/dev'),
        watch: true
      }
    })
    return await new Promise((resolve, reject) => {
      rollupWatcher.on('event', (event) => {
        if (event.code === 'BUNDLE_END') {
          resolve(rollupWatcher)
        }
      })
    })
  } catch (error) {
    createLogger().error(
      chalk.red(`error during watch main process:\n${error.stack}`)
    )
    process.exit(1)
  }
}

function startElectron(RENDERER_URL) {
  let args = [
    '--inspect=5858',
    path.join(__dirname, '../dist/dev/main.cjs.js'),
  ]

  if (process.env.npm_execpath.endsWith('yarn.js')) {
    args = args.concat(process.argv.slice(3))
  } else if (process.env.npm_execpath.endsWith('npm-cli.js')) {
    args = args.concat(process.argv.slice(2))
  }

  electronProcess = spawn(electron, args, {env: {
    ...process.env,
    RENDERER_URL
  }})

  electronProcess.on('close', () => {
    if (!manualRestart) process.exit()
  })
}

async function start() {
  const rendererServer = await startRenderer()
  const { port = 3000, https = false} = rendererServer.config.server
  const RENDERER_URL = `http${https ? 's' : ''}://localhost:${port}`
  
  const mainWatcher = await watchMainProcess(MAIN_ROOT)
  const mainPreloadWatcher = await watchMainProcess(MAIN_PRELOAD_ROOT)

  startElectron(RENDERER_URL)

  const manageElectronProcess = (event) => {
    if (event.code !== 'BUNDLE_END') {
      return
    }

    if (electronProcess && electronProcess.kill) {
      manualRestart = true
      process.kill(electronProcess.pid)
      electronProcess = null
      startElectron(RENDERER_URL)

      setTimeout(() => {
        manualRestart = false
      }, 5000)
    }
  }

  mainWatcher.on('event', manageElectronProcess)
  mainPreloadWatcher.on('event', manageElectronProcess)
}

start()
