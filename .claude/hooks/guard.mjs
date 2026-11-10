// PreToolUse hook: blocks dangerous shell commands, whatever their spelling.
// Exit code 2 = blocked; the message on stderr goes back to the agent.
let input = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (chunk) => (input += chunk))
process.stdin.on('end', () => {
  let command = ''
  try {
    command = JSON.parse(input).tool_input?.command ?? ''
  } catch {
    process.exit(0)
  }

  // Text in quotes (e.g. commit messages) is not a command; drop it before checking.
  const unquoted = command.replace(/'[^']*'|"(?:[^"\\]|\\.)*"/g, '""')
  const parts = unquoted.split(/&&|\|\||;|\||\n/).map((part) => part.trim())
  for (const part of parts) {
    const words = part.split(/\s+/).map((word) => word.replace(/^['"]|['"]$/g, ''))
    const reason = check(words)
    if (reason) {
      console.error(
        `Blockiert: ${reason} (AGENTS.md, Regel 13). Stattdessen der Person das Problem in 2 Sätzen erklären.`,
      )
      process.exit(2)
    }
  }
  process.exit(0)
})

function check(words) {
  const git = words.indexOf('git')
  if (git !== -1 && words.slice(git + 1).includes('push')) {
    const args = words.slice(words.indexOf('push', git) + 1)
    const forced = args.some(
      (arg) =>
        arg === '-f' ||
        arg.startsWith('--force') ||
        arg === '--mirror' ||
        arg === '--delete' ||
        arg === '-d' ||
        (/^-[a-zA-Z]+$/.test(arg) && arg.includes('f')) ||
        (arg.startsWith('+') && arg.length > 1) ||
        (arg.startsWith(':') && arg.length > 1),
    )
    if (forced) return 'git push mit Überschreiben oder Löschen'
  }

  const rm = words.findIndex((word) => word === 'rm' || word.endsWith('/rm'))
  if (rm !== -1) {
    const flags = words.slice(rm + 1).filter((arg) => arg.startsWith('-'))
    const recursive = flags.some((f) => f === '--recursive' || /^-[a-zA-Z]*[rR]/.test(f))
    if (recursive) return 'rekursives Löschen mit rm'
  }

  const find = words.findIndex((word) => word === 'find' || word.endsWith('/find'))
  if (find !== -1) {
    const args = words.slice(find + 1)
    if (args.includes('-delete') || (args.includes('-exec') && args.includes('rm'))) {
      return 'Löschen mit find'
    }
  }

  if (git !== -1) {
    const sub = words.slice(git + 1)
    if (sub[0] === 'reset' && sub.includes('--hard')) return 'git reset --hard'
    if (sub[0] === 'clean' && sub.some((arg) => /^-[a-zA-Z]*f/.test(arg))) return 'git clean -f'
  }
  return null
}
