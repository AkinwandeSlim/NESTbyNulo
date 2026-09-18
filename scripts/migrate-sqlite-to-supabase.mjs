// One-off migration: copy all data from local SQLite (prisma/dev.db)
// to Supabase Postgres. Truncates remote tables first (they were already
// backed up to ../backup/supabase-pre-migration.json), then inserts in
// FK-safe order. Values are converted per the *Postgres* column type:
//   boolean <- 0/1 ints, bigint <- JS numbers (as strings), timestamptz <- ISO text
// Usage: node scripts/migrate-sqlite-to-supabase.mjs
import pgLib from 'pg'
import { DatabaseSync } from 'node:sqlite'

const REMOTE =
  'postgresql://postgres.rkhkeqozjrfocvxqnvdn:NuloAfrica2026@aws-1-eu-west-1.pooler.supabase.com:5432/postgres'

// FK-safe insert order (parents before children)
const TABLES = [
  'User',
  'InvestorProfile',
  'DeveloperProfile',
  'PropertyManagerProfile',
  'Wallet',
  'Property',
  'SPV',
  'PropertyDocument',
  'PropertyMedia',
  'InvestmentOpportunity',
  'Investment',
  'Transaction',
  'RentalDistribution',
  'Valuation',
  'MaintenanceRequest',
  'Notification',
  'SupportTicket',
  'AuditLog',
  'Referral',
  'LearningContent',
  'LearningProgress',
]

const pg = new pgLib.Client({
  connectionString: REMOTE,
  ssl: { rejectUnauthorized: false },
})
await pg.connect()

// 1. Column metadata from Postgres
const colRes = await pg.query(`
  select table_name, column_name, data_type
  from information_schema.columns
  where table_schema = 'public'
`)
const pgCols = {}
for (const r of colRes.rows) {
  ;(pgCols[r.table_name] ||= {})[r.column_name] = r.data_type
}

// 2. Local SQLite
const lite = new DatabaseSync('prisma/dev.db', { readOnly: true })

function convert(value, dataType) {
  if (value === null || value === undefined) return null
  switch (dataType) {
    case 'boolean': {
      if (typeof value === 'boolean') return value
      if (typeof value === 'number') return value !== 0
      const s = String(value).toLowerCase()
      return s === '1' || s === 'true' || s === 't'
    }
    case 'bigint':
      return String(BigInt(value)) // pg accepts text for int8
    case 'smallint':
    case 'integer':
    case 'double precision':
    case 'real':
    case 'numeric':
      return Number(value)
    case 'timestamp with time zone':
    case 'timestamp without time zone':
    case 'date': {
      if (typeof value === 'number') return new Date(value).toISOString()
      return String(value) // Postgres parses Prisma's ISO text fine
    }
    case 'json':
    case 'jsonb':
      return value === '' ? null : String(value)
    default:
      return typeof value === 'number' || typeof value === 'bigint'
        ? String(value)
        : value
  }
}

// 3. Truncate remote (backup already exists)
const quoted = TABLES.map((t) => `"${t}"`).join(', ')
await pg.query(`truncate table ${quoted} cascade`)
console.log('Remote tables truncated.')

// 4. Copy
const totals = {}
for (const table of TABLES) {
  const rows = lite.prepare(`select * from "${table}"`).all()
  totals[table] = rows.length
  if (rows.length === 0) {
    console.log(`${table}: 0 rows (skipped)`)
    continue
  }
  const types = pgCols[table] || {}
  const cols = Object.keys(rows[0]).filter((c) => c in types)
  const colList = cols.map((c) => `"${c}"`).join(', ')

  const BATCH = Math.max(1, Math.floor(60000 / cols.length))
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH)
    const params = []
    const tuples = slice.map((row) => {
      const vals = cols.map((c) => convert(row[c], types[c]))
      const ph = vals.map((v) => {
        params.push(v)
        return '$' + params.length
      })
      return '(' + ph.join(', ') + ')'
    })
    await pg.query(
      `insert into "${table}" (${colList}) values ${tuples.join(', ')}`,
      params
    )
  }
  console.log(`${table}: ${rows.length} rows migrated`)
}

// 5. Verify
console.log('=== Verification (remote counts) ===')
for (const t of TABLES) {
  const q = await pg.query(`select count(*)::int as n from "${t}"`)
  const ok = q.rows[0].n === totals[t] ? 'OK' : 'MISMATCH'
  console.log(`${t}: ${q.rows[0].n} (local had ${totals[t]}) ${ok}`)
}

await pg.end()
lite.close()
