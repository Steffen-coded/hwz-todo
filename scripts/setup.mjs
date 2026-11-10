// Task 1 in one command:
// 1. writes every file from docs/STACK.md («Dateien für Task 1») that does not exist yet,
// 2. installs the newest compatible versions of all allowed packages,
// 3. adds the shadcn/ui components.
// Usage: node scripts/setup.mjs            -> newest compatible versions
//        node scripts/setup.mjs --tested   -> last tested versions (fallback)
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { createRequire } from 'node:module'

const DEPENDENCIES = [
  '@dnd-kit/core',
  '@dnd-kit/sortable',
  '@dnd-kit/utilities',
  '@fontsource-variable/fredoka',
  '@fontsource-variable/inter',
  '@fontsource-variable/jetbrains-mono',
  '@fontsource-variable/nunito',
  '@fontsource-variable/outfit',
  '@fontsource-variable/space-grotesk',
  'canvas-confetti',
  'class-variance-authority',
  'cn',
  'lucide-react',
  'motion',
  'next-themes',
  'radix-ui',
  'react',
  'react-dom',
  'sonner',
]

const DEV_DEPENDENCIES = [
  '@eslint/js',
  '@tailwindcss/vite',
  '@testing-library/dom',
  '@testing-library/jest-dom',
  '@testing-library/react',
  '@testing-library/user-event',
  '@types/canvas-confetti',
  '@types/node',
  '@types/react',
  '@types/react-dom',
  '@vitejs/plugin-react',
  'eslint',
  'eslint-plugin-react-hooks',
  'eslint-plugin-react-refresh',
  'globals',
  'jsdom',
  'prettier',
  'shadcn',
  'tailwindcss',
  'tw-animate-css',
  'typescript',
  'typescript-eslint',
  'vite',
  'vitest',
]

const SHADCN_COMPONENTS = [
  'button',
  'input',
  'card',
  'checkbox',
  'badge',
  'dialog',
  'dropdown-menu',
  'tooltip',
  'progress',
  'separator',
  'sonner',
]

const DAY = 24 * 60 * 60 * 1000
const MIN_AGE_DAYS = 1

// Last tested versions (22.10.2026, Node 20.19 to 24). Only used with --tested.
const TESTED = {
  '@dnd-kit/core': '6.3.1',
  '@dnd-kit/sortable': '10.0.0',
  '@dnd-kit/utilities': '3.2.2',
  '@fontsource-variable/fredoka': '5.3.0',
  '@fontsource-variable/inter': '5.3.0',
  '@fontsource-variable/jetbrains-mono': '5.3.0',
  '@fontsource-variable/nunito': '5.3.0',
  '@fontsource-variable/outfit': '5.3.0',
  '@fontsource-variable/space-grotesk': '5.3.0',
  'canvas-confetti': '1.9.4',
  'class-variance-authority': '0.7.1',
  cn: '0.5.0',
  'lucide-react': '1.61.0',
  motion: '14.5.0',
  'next-themes': '0.4.6',
  'radix-ui': '1.8.1',
  react: '19.3.1',
  'react-dom': '19.3.1',
  sonner: '2.0.8',
  '@eslint/js': '10.0.1',
  '@tailwindcss/vite': '4.3.3',
  '@testing-library/dom': '10.4.2',
  '@testing-library/jest-dom': '7.0.1',
  '@testing-library/react': '16.3.3',
  '@testing-library/user-event': '14.6.8',
  '@types/canvas-confetti': '1.9.0',
  '@types/node': '24.19.2',
  '@types/react': '19.3.0',
  '@types/react-dom': '19.3.0',
  '@vitejs/plugin-react': '6.1.2',
  eslint: '10.13.0',
  'eslint-plugin-react-hooks': '7.1.1',
  'eslint-plugin-react-refresh': '0.5.7',
  globals: '17.13.0',
  jsdom: '29.1.1',
  prettier: '3.9.10',
  shadcn: '4.22.1',
  tailwindcss: '4.3.3',
  'tw-animate-css': '1.4.0',
  typescript: '6.0.3',
  'typescript-eslint': '8.72.0',
  vite: '8.3.5',
  vitest: '4.1.12',
}

const run = (cmd) => execSync(cmd, { stdio: 'inherit' })
const read = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim()

function fail(message) {
  console.error(`\n✖ ${message}`)
  process.exit(1)
}

async function fetchJson(url, headers = {}) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers })
      if (res.ok) return await res.json()
      if (res.status === 404) throw new Error(`404 ${url}`)
    } catch (error) {
      if (attempt === 3) throw error
    }
    await new Promise((r) => setTimeout(r, 1000 * attempt))
  }
  throw new Error(`Request failed: ${url}`)
}

async function resolveNewest(names) {
  // semver comes temporarily; the real install below removes it again.
  run('npm install --no-save --no-package-lock --no-audit --no-fund semver')
  const semver = createRequire(import.meta.url)(`${process.cwd()}/node_modules/semver`)

  // Every version must run on the local Node and on the newest Node LTS (used by GitHub Actions).
  const nodeVersions = [process.versions.node]
  let releases = []
  let ltsVersion = null
  try {
    releases = (await fetchJson('https://nodejs.org/dist/index.json')).map((r) => ({
      version: r.version.slice(1),
      lts: Boolean(r.lts),
    }))
    ltsVersion = releases.find((r) => r.lts)?.version ?? null
    if (ltsVersion) nodeVersions.push(ltsVersion)
  } catch {
    console.warn('! Node-LTS nicht abrufbar, prüfe nur die lokale Node-Version.')
  }

  const registry = read('npm config get registry').replace(/\/?$/, '/')
  const meta = {}
  await Promise.all(
    names.map(async (name) => {
      meta[name] = await fetchJson(registry + name.replace('/', '%2F'))
    }),
  )

  // Candidates: stable, not deprecated, not newer than "latest", runs on local Node and on Node LTS.
  const candidates = {}
  for (const name of names) {
    const { versions, 'dist-tags': tags, time = {} } = meta[name]
    candidates[name] = Object.keys(versions)
      .filter((v) => semver.valid(v) && !semver.prerelease(v))
      .filter((v) => !versions[v].deprecated)
      .filter((v) => semver.lte(v, tags.latest))
      // Only versions that are at least MIN_AGE_DAYS old: new releases sometimes break for a day.
      .filter((v) => !time[v] || Date.now() - Date.parse(time[v]) >= MIN_AGE_DAYS * DAY)
      .filter((v) => {
        const range = versions[v].engines?.node
        return !range || nodeVersions.every((n) => semver.satisfies(n, range))
      })
      .sort(semver.rcompare)
    // Node types should match the Node major version (newest LTS), not a future Node release.
    if (name === '@types/node') {
      const major = semver.major(ltsVersion ?? process.versions.node)
      const matching = candidates[name].filter((v) => semver.major(v) === major)
      if (matching.length > 0) candidates[name] = matching
    }
    if (candidates[name].length === 0) {
      fail(
        `Keine Version von ${name} läuft auf Node ${process.versions.node}. Bitte die aktuelle Node-LTS von nodejs.org installieren.`,
      )
    }
  }

  // Start with the newest version, then lower peers until every peer range fits.
  const chosen = Object.fromEntries(names.map((n) => [n, candidates[n][0]]))
  for (let round = 0; round < 20; round++) {
    let changed = false
    for (const name of names) {
      const ranges = names
        .map((other) => meta[other].versions[chosen[other]].peerDependencies?.[name])
        .filter(Boolean)
      const best = candidates[name].find((v) => ranges.every((r) => semver.satisfies(v, r)))
      if (!best)
        fail(
          `Kein passendes ${name} für ${ranges.join(' und ')}. Fallback: node scripts/setup.mjs --tested`,
        )
      if (best !== chosen[name]) {
        chosen[name] = best
        changed = true
      }
    }
    if (!changed) {
      const ranges = names.map((n) => meta[n].versions[chosen[n]].engines?.node).filter(Boolean)
      return { versions: chosen, engines: computeEngines(semver, ranges, releases) }
    }
  }
  fail('Versionen passen nicht zusammen. Fallback: node scripts/setup.mjs --tested')
}

// Smallest Node range on which all chosen packages run, e.g. "^22.22.2 || >=24.15.0".
function computeEngines(semver, ranges, releases) {
  if (releases.length === 0) return `>=${process.versions.node}`
  const majors = [...new Set(releases.map((r) => semver.major(r.version)))].sort((a, b) => a - b)
  const lowest = []
  for (const major of majors) {
    const inMajor = releases
      .map((r) => r.version)
      .filter((v) => semver.major(v) === major)
      .sort(semver.compare)
    const ok = inMajor.filter((v) => ranges.every((range) => semver.satisfies(v, range)))
    // Only keep a Node line if its newest release is supported.
    if (ok.length > 0 && ok.at(-1) === inMajor.at(-1)) lowest.push(ok[0])
  }
  if (lowest.length === 0) return `>=${process.versions.node}`
  // Merge trailing Node lines that are fully supported (x.0.0, consecutive) into one ">=" range.
  while (
    lowest.length > 1 &&
    lowest.at(-2).endsWith('.0.0') &&
    lowest.at(-1).endsWith('.0.0') &&
    semver.major(lowest.at(-1)) === semver.major(lowest.at(-2)) + 1
  ) {
    lowest.splice(-1, 1)
  }
  return lowest.map((v, i) => (i === lowest.length - 1 ? `>=${v}` : `^${v}`)).join(' || ')
}

// Copies the files from docs/STACK.md. Existing files are never overwritten.
function writeStackFiles() {
  const stack = readFileSync('docs/STACK.md', 'utf8')
  const start = stack.indexOf('## Dateien für Task 1')
  if (start === -1) fail('Abschnitt «Dateien für Task 1» fehlt in docs/STACK.md.')
  const pattern = /^### `([^`]+)`\n\n(`{3,4})[a-z]*\n([\s\S]*?)\n\2$/gm
  const look = readLook()
  let written = 0
  for (const [, file, , body] of stack.slice(start).matchAll(pattern)) {
    if (existsSync(file)) continue
    let content = `${body}\n`
    if (file === 'index.html')
      content = content.replace('data-look="aurora"', `data-look="${look}"`)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, content)
    written++
    console.log(`  + ${file}`)
  }
  if (!existsSync('package.json')) fail('package.json fehlt nach dem Kopieren aus docs/STACK.md.')
  console.log(`${written} Dateien aus docs/STACK.md angelegt (Look: ${look}).`)
}

// Look from docs/SPEC.md («## Look»), default aurora.
function readLook() {
  if (!existsSync('docs/SPEC.md')) return 'aurora'
  const spec = readFileSync('docs/SPEC.md', 'utf8')
  const section = spec.split(/^## Look\s*$/m)[1]?.split(/^## /m)[0] ?? ''
  const match = section.toLowerCase().match(/\b(aurora|candy|neon)\b/)
  return match ? match[1] : 'aurora'
}

writeStackFiles()

const tested = process.argv.includes('--tested')
const all = [...DEPENDENCIES, ...DEV_DEPENDENCIES]
const { versions, engines } = tested
  ? { versions: TESTED, engines: '>=20.19' }
  : await resolveNewest(all)
const pick = (names) => Object.fromEntries(names.map((n) => [n, versions[n]]))

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
pkg.dependencies = pick(DEPENDENCIES)
pkg.devDependencies = pick(DEV_DEPENDENCIES)
pkg.engines = { node: engines }
writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`)

try {
  run('npm install --no-audit --no-fund')
} catch {
  if (tested) fail('npm install ist fehlgeschlagen. Bitte Internet prüfen und erneut starten.')
  console.warn(
    '\n! Installation der neuesten Versionen fehlgeschlagen. Nehme den zuletzt geprüften Stand.',
  )
  pkg.dependencies = Object.fromEntries(DEPENDENCIES.map((n) => [n, TESTED[n]]))
  pkg.devDependencies = Object.fromEntries(DEV_DEPENDENCIES.map((n) => [n, TESTED[n]]))
  pkg.engines = { node: '>=20.19' }
  writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`)
  run('npm install --no-audit --no-fund')
}

for (let attempt = 1; ; attempt++) {
  try {
    run(`npx shadcn add ${SHADCN_COMPONENTS.join(' ')} --yes --overwrite --silent`)
    break
  } catch (error) {
    if (attempt === 3)
      fail('shadcn nicht erreichbar. Bitte in einer Minute erneut: node scripts/setup.mjs')
    console.warn(`! shadcn-Versuch ${attempt} fehlgeschlagen, neuer Versuch …`)
  }
}

const final = JSON.parse(readFileSync('package.json', 'utf8'))
const extra = Object.keys({ ...final.dependencies, ...final.devDependencies }).filter(
  (name) => !all.includes(name),
)
if (extra.length > 0) {
  console.warn(
    `\n! shadcn hat Pakete ergänzt, die nicht in der Erlaubt-Liste stehen: ${extra.join(', ')}`,
  )
  console.warn('! Bitte die Person fragen, bevor es weitergeht (AGENTS.md, Regel 5).')
}
console.log(`\nNode: ${engines}`)
console.log('Installiert:')
for (const [name, version] of Object.entries({ ...final.dependencies, ...final.devDependencies })) {
  console.log(`  ${name} ${version}`)
}
console.log('\n✓ Setup fertig. Weiter mit: npm run check')
