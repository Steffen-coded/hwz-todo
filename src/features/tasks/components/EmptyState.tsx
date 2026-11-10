export function EmptyState() {
  return (
    <div className="glass flex flex-col items-center gap-4 rounded-2xl border border-dashed p-10 text-center">
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        aria-hidden
        className="hidden [[data-look=aurora]_&]:block"
      >
        <path d="M70 20a40 40 0 1 0 30 62A32 32 0 0 1 70 20z" className="fill-accent" />
        <circle cx="28" cy="24" r="4" className="animate-pulse fill-primary" />
        <circle cx="98" cy="30" r="3" className="animate-pulse fill-primary" />
        <circle cx="20" cy="70" r="3" className="animate-pulse fill-primary" />
      </svg>
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        aria-hidden
        className="hidden [[data-look=candy]_&]:block"
      >
        <path
          d="M34 88a20 20 0 0 1-2-40 26 26 0 0 1 50-6 20 20 0 0 1 8 46z"
          strokeWidth="4"
          strokeLinejoin="round"
          className="fill-accent stroke-primary"
        />
        <circle cx="50" cy="62" r="4" className="fill-primary" />
        <circle cx="72" cy="62" r="4" className="fill-primary" />
        <path
          d="M52 72q9 8 18 0"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          className="stroke-primary"
        />
      </svg>
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        aria-hidden
        className="glow hidden rounded-full [[data-look=neon]_&]:block"
      >
        <circle cx="60" cy="60" r="54" strokeWidth="4" fill="none" className="stroke-primary" />
        <polygon points="66,18 34,66 56,66 50,102 86,50 62,50" className="fill-accent" />
      </svg>
      <p className="font-heading text-xl">Alles erledigt. Zeit für Kaffee.</p>
      <p className="text-muted-foreground">Tippe oben eine neue Aufgabe ein oder drücke N.</p>
    </div>
  )
}
