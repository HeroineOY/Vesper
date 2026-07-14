import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'

import {
  resolveDesktopUserDataDir,
  resolvePortableExecutableDir,
  resolvePortableHermesHome,
  seedPortableHermesHome
} from './portable-runtime'

test('portable Windows builds use data paths beside the executable', () => {
  const portableDir = resolvePortableExecutableDir({
    isPackaged: true,
    platform: 'win32',
    env: { PORTABLE_EXECUTABLE_DIR: 'C:\\Portable\\Vesper' }
  })

  assert.equal(portableDir, path.resolve('C:\\Portable\\Vesper'))
  assert.equal(
    resolveDesktopUserDataDir({ portableExecutableDir: portableDir }),
    path.join(portableDir!, 'data', 'vesper-user-data')
  )
  assert.equal(resolvePortableHermesHome(portableDir), path.join(portableDir!, 'data', 'hermes'))
})

test('development and installed builds do not claim portable paths', () => {
  assert.equal(
    resolvePortableExecutableDir({
      isPackaged: false,
      platform: 'win32',
      env: { PORTABLE_EXECUTABLE_DIR: 'C:\\Portable\\Vesper' }
    }),
    null
  )
})

test('portable seed upgrades only the stock persona and preserves existing memory', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vesper-portable-seed-'))
  const resources = path.join(root, 'resources')
  const seed = path.join(resources, 'portable-seed')
  const home = path.join(root, 'home')
  const sharedMemory = path.join(root, 'shared-memory')
  fs.mkdirSync(path.join(seed, 'memories'), { recursive: true })
  fs.mkdirSync(home, { recursive: true })
  fs.writeFileSync(path.join(seed, 'SOUL.md'), '# Furina\n', 'utf8')
  fs.writeFileSync(path.join(seed, 'config.yaml'), 'memory: {}\n', 'utf8')
  fs.writeFileSync(path.join(seed, 'memory-directory.txt'), sharedMemory, 'utf8')
  fs.writeFileSync(path.join(seed, 'memories', 'USER.md'), 'seed memory\n', 'utf8')
  fs.writeFileSync(path.join(home, 'SOUL.md'), DEFAULT_STOCK_SOUL, 'utf8')

  const first = seedPortableHermesHome({ resourcesPath: resources, hermesHome: home })
  assert.deepEqual(first, {
    config: true,
    soul: true,
    userMemory: true,
    memoryDirectory: sharedMemory,
    memoryLinked: true
  })
  assert.equal(fs.readFileSync(path.join(home, 'SOUL.md'), 'utf8'), '# Furina\n')
  assert.equal(fs.readFileSync(path.join(sharedMemory, 'USER.md'), 'utf8'), 'seed memory\n')

  fs.writeFileSync(path.join(home, 'SOUL.md'), '# My custom persona\n', 'utf8')
  fs.writeFileSync(path.join(sharedMemory, 'USER.md'), 'live memory\n', 'utf8')
  const second = seedPortableHermesHome({ resourcesPath: resources, hermesHome: home })
  assert.deepEqual(second, {
    config: false,
    soul: false,
    userMemory: false,
    memoryDirectory: sharedMemory,
    memoryLinked: true
  })
  assert.equal(fs.readFileSync(path.join(home, 'SOUL.md'), 'utf8'), '# My custom persona\n')
  assert.equal(fs.readFileSync(path.join(sharedMemory, 'USER.md'), 'utf8'), 'live memory\n')
})

const DEFAULT_STOCK_SOUL =
  'You are Hermes Agent, an intelligent AI assistant created by Nous Research. You are helpful, knowledgeable, and direct. You assist users with a wide range of tasks including answering questions, writing and editing code, analyzing information, creative work, and executing actions via your tools. You communicate clearly, admit uncertainty when appropriate, and prioritize being genuinely useful over being verbose unless otherwise directed below. Be targeted and efficient in your exploration and investigations.'
