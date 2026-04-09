---
name: erp-data-parity
description: ERP data parity validation, financial field mapping, sync gap detection, and dashboard data alignment. Use when investigating data discrepancies, validating financial metrics, or troubleshooting sync pipelines between ERP (RP One/RP Info) and internal systems.
version: 1.0.0
---

# ERP Data Parity — Validation & Alignment Skill

**Purpose**: Provide systematic methodology for achieving 100% data parity between ERP systems and internal dashboards. This skill encodes hard-won lessons from production data alignment work.

---

## 🧠 Core Mental Model

### The Data Alignment Triangle

```
          ERP API (Source of Truth)
              /          \
             /            \
            /  Data Flow   \
           /                \
     Sync Job ────────── Database
     (ETL)                (Storage)
           \              /
            \            /
             \          /
          Dashboard (Presentation)
```

**Every discrepancy exists in one of three gaps:**

1. **API → Sync Gap**: Records not fetched (transient failures, pagination bugs)
2. **Sync → DB Gap**: Records fetched but stored incorrectly (field mapping bugs, type coercion)
3. **DB → Dashboard Gap**: Records stored correctly but aggregated wrong (wrong doc codes, wrong fields)

**Your first job is to determine WHICH gap you're dealing with.**

---

## 📊 Investigation Methodology: The Census Technique

### Rule #1: Never Trust Aggregates Alone

```
❌ WRONG: "The total is R$ 28,061.18, so it's correct"
✅ RIGHT: "R$ 28,061.18 across 1,357 records from docs 7470(905) + 7471(404) + 7474(48)"
```

### Rule #2: Compare from the Source First

Always start by querying the ERP API directly. Do NOT start from the database.

```
Step 1: ERP API → What does the source say?
Step 2: Database → What do we have?
Step 3: Delta   → What's the gap?
Step 4: Day-by-day → WHERE is the gap?
Step 5: Fix only the gap
Step 6: Validate ALL metrics
```

### Rule #3: Day-by-Day Granularity

**Never compare month-level totals as the first step.** Always break down by day:

```
March 2026 Investigation:
  Day 01: ERP=0, DB=0 ✓
  Day 02: ERP=65, DB=0 ← MISMATCH (transient API failure)
  Day 03: ERP=23, DB=11 ← MISMATCH (12 records lost)
  Day 04: ERP=34, DB=34 ✓
  ...
```

This immediately tells you EXACTLY which days need re-sync.

---

## 🔬 JavaScript Financial Field Pitfalls

### Pitfall #1: The Falsy Zero (`||` vs `??`)

**This is the #1 cause of financial calculation errors in JavaScript.**

```javascript
// SCENARIO: ERP returns ctEmpresa = 0 for an item with no company cost
const m = { valor: 139.86, ctEmpresa: 0, ctMedio: 0, ctCompra: 0 };

// ❌ USING || (logical OR) — treats 0 as falsy
const cost1 = Number(m.ctEmpresa || m.ctMedio || m.ctCompra || m.valor);
// Result: 139.86 (fell through ALL zeros to valor!) — WRONG

// ✅ USING ?? (nullish coalescing) — only null/undefined trigger fallback
const cost2 = Number(m.ctEmpresa ?? m.ctMedio ?? m.ctCompra ?? m.valor);
// Result: 0 — CORRECT (ctEmpresa IS 0, not null)
```

**Real-world impact**: This single bug caused R$ 1,185.19 error across 17 records in March 2026.

### Pitfall #2: Number Precision in Aggregation

```javascript
// JavaScript floating point accumulation
let sum = 0;
sum += 5.222;  // Internally: 5.222000000000000...
sum += 2.594;  // Internally: 7.816000000000001...

// Always round at the END, never during accumulation
const finalValue = +(sum.toFixed(2)); // Round once, at output
```

### Pitfall #3: Empty Array/Object as Truthy

```javascript
// These are all truthy in JavaScript:
if ([])  { /* runs! */ }
if ({})  { /* runs! */ }
if (0)   { /* does NOT run */ }
if ('')  { /* does NOT run */ }
if (null) { /* does NOT run */ }

// For API responses, always check .length or specific properties
const movs = res?.response?.movimentos || [];
if (movs.length === 0) { /* no data */ }
```

---

## 📋 ERP API Cheat Sheet (RP Info v1.6)

### Base URL Pattern

```
GET /v1.6/movimentoprodutos/listarmovimentos/lastid/{lastId}
    ?datainicial={DD-MM-YYYY}
    &datafinal={DD-MM-YYYY}
    &unidade={unitCode}
    &tipoconsulta={queryType}
    &valores={docCode}
```

### Query Types

| `tipoconsulta` | `valores` | What it fetches |
|----------------|-----------|-----------------|
| `CODIGO_DCTO` | `7470` | All movements with document code 7470 |
| `CODIGO_HISTORICO` | `7740` | All movements with history code 7740 |
| `TIPO_DCTO` | `EVP` | All sale movements (EVP type) |

### Pagination Rules

1. Start with `lastId=0`
2. Each page returns max 100 records
3. Next page: `lastId = lastMovement.id`
4. Stop when: response returns 0 records OR `newLastId === currentLastId`

### Response Structure

```javascript
{
  response: {
    movimentos: [  // or movimentoprodutos in some versions
      {
        id: 12126839,
        data: "20/03/2026",
        unidade: "001",
        codigoProduto: 116742,
        quantidadeUnitaria: 1,
        valor: 5.22,        // ← Valor bruto (sale/loss value)
        valorUnitario: 5.2223,
        ctCompra: 5.222,    // ← Purchase cost
        ctMedio: 5.222,     // ← Weighted average cost
        ctEmpresa: 5.222,   // ← Company cost (for diretoria)
        ctFiscal: 5.222,    // ← Fiscal cost
        ctTransf: 5.222,    // ← Transfer cost
        tipoDcto: "EPE",
        codigoDcto: "7470"
      }
    ]
  }
}
```

### Known API Behaviors

| Behavior | Frequency | Mitigation |
|----------|-----------|------------|
| Transient empty response for valid day | ~5% of syncs | Day-by-day gap detection + targeted re-sync |
| Timeout on heavy days (>2000 movements) | Rare | Set 30s timeout, retry once |
| Different response key names | Version-dependent | Check both `movimentos` and `movimentoprodutos` |
| Date format `DD/MM/YYYY` in response vs `DD-MM-YYYY` in query | Always | Parse carefully with locale awareness |

---

## 🗄️ Database Schema Reference (DashMovement)

```prisma
model DashMovement {
  id        Int      @id @default(autoincrement())
  erpId     Int      @unique     // ERP movement ID — prevents duplicates
  date      DateTime
  unit      String              // "001", "004", etc.
  type      String              // "LOSS" or "REVENUE"
  docType   String              // "7470", "7471", "EVP", etc.
  productId Int
  value     Float               // valor bruto from ERP
  cost      Float               // ctEmpresa (LOSS) or ctCompra (REVENUE)
  quantity  Float
  status    String @default("NORMAL")
}
```

### Key Design Decisions

- **`erpId @unique`**: Prevents duplicate ingestion. Upsert is safe to retry.
- **`value` = `valor`**: ALWAYS the original sale/loss value. Never modified.
- **`cost` = `ctEmpresa`**: For LOSS records. `ctCompra` for REVENUE. Enables Valor/Ct Empresa toggle.
- **Day-by-day sync**: One API call per day per doc type. Prevents month-level API timeouts.

---

## 🔄 Sync Pipeline Architecture

### dashboard_sync_job.js Flow

```
syncPeriod(unit, startDate, endDate)
│
├── For each calendar day in [startDate, endDate]:
│   │
│   ├── Query REVENUE docs (EVP via TIPO_DCTO)
│   ├── Query each LOSS doc (7470, 7471, 7474, 7472, 7512, 7520 via CODIGO_DCTO)
│   ├── Query DEPRECIATION (7740 via CODIGO_HISTORICO)
│   │
│   ├── For each query:
│   │   └── fetchPaginatedMovements → lastId pagination
│   │       └── Collects all pages until empty
│   │
│   ├── Deduplicate via uniqueMap (key = erpId)
│   │
│   ├── Map fields:
│   │   ├── value = Number(m.valor || 0)
│   │   ├── cost  = LOSS ? (m.ctEmpresa ?? m.ctMedio ?? m.ctCompra ?? val)
│   │   │          REVENUE ? (m.ctCompra ?? m.ctMedio ?? m.ctEmpresa ?? val)
│   │   ├── type  = computed from doc configuration
│   │   └── erpId = Number(m.id)
│   │
│   └── Upsert batch to PostgreSQL (erpId as unique key)
│
└── Report: "Total unique records synced: N"
```

### Configuration (.env)

```env
ERP_DOC_IDENTIFIED='{"default": ["7470", "7471", "7474"]}'
ERP_DOC_SOBRA='{"default": ["7512"]}'
ERP_DOC_FALTA='{"default": ["7520"]}'
ERP_DOC_USO_CONSUMO='{"default": ["7472"]}'
ERP_DOC_REVENUE='["EVP"]'
```

---

## 📊 Dashboard Aggregation Logic (dashboard_module.js)

### prepareDashboardData Flow

```
1. Fetch ALL DashMovement records for period + unit + department filters
2. For each movement:
   │
   ├── Extract: val = m.value, cost = m.cost || val
   │
   ├── if LOSS:
   │   ├── if doc in SOBRA   → totals.sobras += val,    totalsCost.sobras += cost
   │   ├── if doc in FALTA   → totals.faltas += val,    totalsCost.faltas += cost
   │   ├── if doc in IDENTIFIED → totals.identified += val, totalsCost.identified += cost
   │   └── if doc in USO_CONSUMO → totals.usoConsumo += val, totalsCost.usoConsumo += cost
   │
   └── if REVENUE (EVP):
       └── totals.revenue += val,  totalsCost.revenue += val  // Revenue ALWAYS uses sale value
       
3. Return: { totals, totalsCost, departments, topProducts, groups, trend }
```

### API Response Shape

```json
{
  "totals": {
    "identified": 28061.18,
    "faltas": 850296.62,
    "sobras": 326697.70,
    "inventory": 523598.92,
    "totalLoss": 551660.10,
    "revenue": 3200000.00,
    "usoConsumo": 8188.67,
    "pct": 17.24
  },
  "totalsCost": {
    "identified": 30645.19,
    "faltas": 900123.45,
    "sobras": 340567.89,
    "...": "same structure, but using ctEmpresa values"
  }
}
```

---

## ✅ Validation Scripts Catalog

### Script 1: Full Census (ERP vs DB)

**When**: Any time you suspect a data discrepancy.

```javascript
// Fetches ALL records from ERP API and compares with DB
// Shows: record count, value sum, cost sum for each doc type
// Identifies: exact gap in R$ and records
```

### Script 2: Day-by-Day Gap Detection

**When**: Census shows a gap. Need to find WHICH days are affected.

```javascript
// For each day in the period:
//   Count ERP records for doc type
//   Count DB records for same day + doc type
//   If mismatch: flag for re-sync
```

### Script 3: Financial Field Method Comparison

**When**: "Ct Empresa" doesn't match the ERP report.

```javascript
// Tests 11 different calculation methods against the ERP target:
// sum(valor), sum(ctEmpresa), sum(ctMedio), sum(ctCompra), etc.
// Each with and without qty multiplication
// Shows which method EXACTLY matches the target
```

### Script 4: Targeted Re-sync

**When**: Specific days identified as having gaps.

```javascript
// Re-syncs ONLY the identified gap days
// Uses syncPeriod(unit, day, day) for each affected day
// Validates totals after completion
```

---

## 🎯 Decision Trees

### "The number doesn't match" Decision Tree

```
The dashboard shows R$ X but the ERP report says R$ Y
│
├── Is the difference in record COUNT?
│   ├── YES → SYNC GAP
│   │   └── Day-by-day census → identify missing days → re-sync those days
│   │
│   └── NO (same count, different sum) → FIELD MAPPING BUG
│       ├── Is it a "Ct Empresa" comparison?
│       │   ├── YES → Check if using || instead of ?? for ctEmpresa
│       │   └── NO → Check which field is being summed (valor vs ctEmpresa vs ctMedio)
│       │
│       └── Run Financial Field Method Comparison script
│           └── The method that matches = the correct one
│
└── Is the difference exactly the sum of known "problem" records?
    ├── YES → Known issue (ctEmpresa=0 trap, specific day failure)
    └── NO → Unknown cause → Full census from ERP API
```

### "Which cost field should I use?" Decision Tree

```
What does the user/report need?
│
├── "Valor" / "Valor NF" / "Valor Bruto"
│   └── Use: m.valor (stored in DB as: value)
│
├── "Ct Empresa" / "Custo Empresa"
│   └── Use: m.ctEmpresa (stored in DB as: cost for LOSS)
│
├── "CMV" / "Custo Médio"
│   └── Use: m.ctMedio (may need separate DB field or real-time calc)
│
├── "Custo de Compra"
│   └── Use: m.ctCompra (stored in DB as: cost for REVENUE)
│
└── "Custo Fiscal"
    └── Use: m.ctFiscal (not currently stored, would need schema change)
```

---

## 🏗️ Implementation Patterns

### Adding a New Document Type to Sync

1. Add to `.env` configuration
2. Update `dashboard_sync_job.js` query list
3. Update `dashboard_module.js` aggregation logic (both `totals` AND `totalsCost`)
4. Update Flutter UI indicators
5. Run full sync for the new doc type
6. Validate with census

### Adding a New Cost Field Toggle

1. Ensure the field is synced in `dashboard_sync_job.js` (use `??` not `||`)
2. Add parallel aggregation in `dashboard_module.js`
3. Return both sets in API response
4. Add toggle in Flutter `_buildFilterSheet`
5. Update indicator grid to read from correct set
6. Update dept/product tables

---

> **This skill is a living document.** Update it every time a new data alignment pattern is discovered or a new ERP API behavior is identified.
