import fs from 'node:fs'
import path from 'node:path'

const DEFAULT_HERMES_SOUL =
  'You are Hermes Agent, an intelligent AI assistant created by Nous Research. You are helpful, knowledgeable, and direct. You assist users with a wide range of tasks including answering questions, writing and editing code, analyzing information, creative work, and executing actions via your tools. You communicate clearly, admit uncertainty when appropriate, and prioritize being genuinely useful over being verbose unless otherwise directed below. Be targeted and efficient in your exploration and investigations.'

export function resolvePortableExecutableDir({
  isPackaged,
  platform = process.platform,
  env = process.env
}: {
  isPackaged: boolean
  platform?: NodeJS.Platform
  env?: NodeJS.ProcessEnv
}): string | null {
  const value = env.PORTABLE_EXECUTABLE_DIR?.trim()

  return isPackaged && platform === 'win32' && value ? path.resolve(value) : null
}

export function resolveDesktopUserDataDir({
  override,
  portableExecutableDir
}: {
  override?: string
  portableExecutableDir?: string | null
}): string | null {
  if (override?.trim()) {
    return path.resolve(override)
  }

  if (portableExecutableDir) {
    return path.join(portableExecutableDir, 'data', 'vesper-user-data')
  }

  return null
}

export function resolvePortableHermesHome(portableExecutableDir: string | null): string | null {
  return portableExecutableDir ? path.join(portableExecutableDir, 'data', 'hermes') : null
}

function copyIfMissing(source: string, destination: string): boolean {
  if (!fs.existsSync(source) || fs.existsSync(destination)) {
    return false
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true })

  try {
    fs.copyFileSync(source, destination, fs.constants.COPYFILE_EXCL)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
      return false
    }

    throw error
  }

  return true
}

export interface PortableSeedResult {
  config: boolean
  soul: boolean
  userMemory: boolean
  memoryDirectory: string | null
}

export function seedPortableHermesHome({
  resourcesPath,
  hermesHome
}: {
  resourcesPath: string
  hermesHome: string
}): PortableSeedResult {
  const result: PortableSeedResult = {
    config: false,
    soul: false,
    userMemory: false,
    memoryDirectory: null
  }

  const seedRoot = path.join(resourcesPath, 'portable-seed')

  if (!fs.existsSync(seedRoot)) {
    return result
  }

  fs.mkdirSync(hermesHome, { recursive: true })
  result.config = copyIfMissing(path.join(seedRoot, 'config.yaml'), path.join(hermesHome, 'config.yaml'))

  const soulSource = path.join(seedRoot, 'SOUL.md')
  const soulDestination = path.join(hermesHome, 'SOUL.md')

  if (fs.existsSync(soulSource)) {
    const existing = fs.existsSync(soulDestination)
      ? fs
          .readFileSync(soulDestination, 'utf8')
          .replace(/^\uFEFF/, '')
          .trim()
      : ''

    if (!existing || existing === DEFAULT_HERMES_SOUL) {
      fs.copyFileSync(soulSource, soulDestination)
      result.soul = true
    }
  }

  const memoryDirectoryFile = path.join(seedRoot, 'memory-directory.txt')

  const configuredMemoryDirectory = fs.existsSync(memoryDirectoryFile)
    ? fs
        .readFileSync(memoryDirectoryFile, 'utf8')
        .replace(/^\uFEFF/, '')
        .trim()
    : ''

  const memoryDirectory = configuredMemoryDirectory || path.join(hermesHome, 'memories')
  result.memoryDirectory = memoryDirectory

  try {
    result.userMemory = copyIfMissing(path.join(seedRoot, 'memories', 'USER.md'), path.join(memoryDirectory, 'USER.md'))
  } catch {
    const fallbackMemoryDirectory = path.join(hermesHome, 'memories')
    result.memoryDirectory = fallbackMemoryDirectory
    result.userMemory = copyIfMissing(
      path.join(seedRoot, 'memories', 'USER.md'),
      path.join(fallbackMemoryDirectory, 'USER.md')
    )
  }

  return result
}
