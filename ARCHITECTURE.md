# 🏗️ Arquitectura Técnica - TaxiMeter

## 📊 Diagrama de Componentes

```
App.tsx
  ├── AuthProvider (context/AuthContext.tsx)
  │   ├── AuthPage (components/auth/AuthPage.tsx)
  │   │   └── Login / Register Forms
  │   └── Dashboard (components/Dashboard.tsx)
  │       ├── Header (inline)
  │       │   ├── Logo + User Info
  │       │   ├── Export CSV Button
  │       │   └── Logout Button
  │       ├── DateFilter (inline)
  │       │   └── Today / Week / Month / All
  │       ├── Stats (components/Stats.tsx)
  │       │   ├── Income Card
  │       │   ├── Expenses Card
  │       │   └── Profit Card
  │       ├── TransactionList (components/TransactionList.tsx)
  │       │   └── Grouped by date
  │       │       └── TransactionItem[]
  │       ├── FloatingButtons (inline)
  │       │   ├── Add Income Button
  │       │   └── Add Expense Button
  │       └── TransactionForm (components/TransactionForm.tsx)
  │           ├── Amount Input
  │           ├── Date Input
  │           ├── Category/PaymentMethod Selector
  │           └── Notes Textarea
  └── Toaster (sonner)
```

---

## 🔄 Flujo de Datos

### 1. Autenticación
```
User Input (email/password)
  ↓
AuthContext.signIn/signUp()
  ↓
Supabase Auth API
  ↓
JWT Token stored in localStorage
  ↓
User state updated in AuthContext
  ↓
App re-renders → Dashboard
```

### 2. Cargar Transacciones
```
Dashboard mounts
  ↓
useTransactions(filter) hook
  ↓
supabase.from('transactions').select()
  ↓
RLS verifica: auth.uid() = user_id
  ↓
PostgreSQL query con WHERE + ORDER BY
  ↓
Data returned
  ↓
Calculate stats (reduce)
  ↓
Update state → Components re-render
```

### 3. Añadir Transacción
```
User clicks FAB (Floating Action Button)
  ↓
TransactionForm modal opens
  ↓
User fills form + clicks Submit
  ↓
addTransaction(input)
  ↓
supabase.from('transactions').insert()
  ↓
RLS verifica: auth.uid() = user_id
  ↓
PostgreSQL INSERT
  ↓
Success → toast.success()
  ↓
fetchTransactions() → Refresh data
  ↓
Stats recalculated → UI updates
```

### 4. Exportar CSV
```
User clicks Download button
  ↓
Check: transactions.length > 0
  ↓
Map transactions to CSV rows
  ↓
Create CSV string
  ↓
Create Blob + Download link
  ↓
Trigger download
  ↓
toast.success()
```

---

## 🗂️ Estructura de Archivos (Detallada)

```
/
├── App.tsx                          # Root component + routing logic
├── types/index.ts                   # TypeScript type definitions
│
├── context/
│   └── AuthContext.tsx              # Authentication state management
│
├── hooks/
│   └── useTransactions.ts           # Transactions CRUD + stats logic
│
├── components/
│   ├── auth/
│   │   └── AuthPage.tsx             # Login + Register combined
│   ├── Dashboard.tsx                # Main app view (authenticated)
│   ├── Stats.tsx                    # 3 stat cards (Income, Expenses, Profit)
│   ├── TransactionList.tsx          # List with grouping by date
│   ├── TransactionForm.tsx          # Modal form for add/edit
│   └── EmptyState.tsx               # Reusable empty state component
│
├── utils/
│   ├── supabase/
│   │   ├── client.ts                # Supabase client initialization
│   │   └── info.tsx                 # Auto-generated config (projectId, key)
│   ├── constants.ts                 # App-wide constants
│   └── formatters.ts                # Currency & date formatting utilities
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql   # Database schema + RLS policies
│
└── styles/
    └── globals.css                  # Tailwind v4 + custom CSS variables
```

---

## 🔐 Row Level Security (RLS) Policies

### Tabla: `transactions`

| Operación | Política | Condición |
|-----------|----------|-----------|
| **SELECT** | `Users can view own transactions` | `auth.uid() = user_id` |
| **INSERT** | `Users can insert own transactions` | `auth.uid() = user_id` |
| **UPDATE** | `Users can update own transactions` | `auth.uid() = user_id` |
| **DELETE** | `Users can delete own transactions` | `auth.uid() = user_id` |

**Cómo funciona:**
1. User autenticado → Supabase genera JWT con `user_id`
2. Cada query a PostgreSQL incluye el JWT
3. PostgreSQL ejecuta política RLS antes de la query
4. Solo retorna/modifica filas donde `user_id` coincide

---

## 🎣 Hooks Personalizados

### `useTransactions(filter: DateFilter)`

**Propósito:** Centralizar toda la lógica de transacciones

**Estado interno:**
- `transactions: Transaction[]` - Lista de transacciones
- `stats: Stats` - Estadísticas calculadas
- `loading: boolean` - Estado de carga

**Métodos:**
- `addTransaction(input)` - Crear nueva transacción
- `deleteTransaction(id)` - Eliminar transacción
- `refresh()` - Recargar datos

**Efectos:**
- Recarga datos cuando cambia `filter`
- Calcula stats cada vez que cambian las transacciones

**Flujo interno:**
```typescript
useEffect(() => {
  const fetchTransactions = async () => {
    // 1. Calcular rango de fechas según filter
    const dateRange = getDateRange(filter);
    
    // 2. Query a Supabase con filtro de fecha
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', dateRange.start)
      .order('date', { ascending: false });
    
    // 3. Calcular estadísticas
    const income = data.filter(t => t.type === 'income')
                       .reduce((sum, t) => sum + t.amount, 0);
    
    // 4. Actualizar estado
    setTransactions(data);
    setStats({ totalIncome: income, ... });
  };
  
  fetchTransactions();
}, [filter]);
```

---

## 🎨 Decisiones de Diseño

### 1. Context API vs Redux
**Decisión:** Context API  
**Razón:** Solo necesitamos un estado global (auth), no múltiples stores complejos

### 2. Una tabla vs Dos tablas (incomes/expenses)
**Decisión:** Una tabla `transactions` con campo `type`  
**Razón:**
- Más simple de mantener
- Queries más eficientes (un solo JOIN)
- Más fácil de extender (añadir transfers, refunds, etc.)

### 3. Client-side stats vs Database views
**Decisión:** Client-side con `reduce()`  
**Razón:**
- Dataset pequeño (< 1000 transacciones por usuario)
- Mayor flexibilidad para filtros dinámicos
- Menos complejidad en backend

### 4. Modal vs Página separada para formularios
**Decisión:** Modal (TransactionForm)  
**Razón:**
- Menos navegación = más rápido
- Mantiene contexto visual (ve stats mientras añade)
- Mejor UX en móvil (slide-up animation)

---

## ⚡ Optimizaciones de Performance

### 1. Índices de Base de Datos
```sql
-- Para queries filtradas por usuario + fecha (99% de los casos)
CREATE INDEX idx_transactions_user_date 
  ON transactions(user_id, date DESC);

-- Para queries filtradas por tipo
CREATE INDEX idx_transactions_type 
  ON transactions(user_id, type, date DESC);
```

### 2. React Optimizations
- **Memoización:** No necesaria (componentes simples)
- **Lazy loading:** No necesario (app pequeña)
- **Code splitting:** Podría añadirse para Dashboard vs Auth

### 3. Supabase Optimizations
- **Realtime deshabilitado:** No es necesario para este MVP
- **Connection pooling:** Manejado automáticamente por Supabase
- **Caching:** Client-side con React state

---

## 🧪 Estrategia de Testing (Futuro)

### Unit Tests
```typescript
// hooks/useTransactions.test.ts
describe('useTransactions', () => {
  it('calculates stats correctly', () => {
    const transactions = [
      { type: 'income', amount: 100 },
      { type: 'expense', amount: 30 }
    ];
    
    const stats = calculateStats(transactions);
    expect(stats.profit).toBe(70);
  });
});

// utils/formatters.test.ts
describe('formatCurrency', () => {
  it('formats euros correctly', () => {
    expect(formatCurrency(1234.56)).toBe('1.234,56 €');
  });
});
```

### Integration Tests
```typescript
// Dashboard.integration.test.ts
describe('Dashboard flow', () => {
  it('adds income and updates stats', async () => {
    // Render Dashboard
    // Click add income button
    // Fill form
    // Submit
    // Verify stats updated
  });
});
```

### E2E Tests (Cypress/Playwright)
```typescript
describe('User journey', () => {
  it('completes full workflow', () => {
    cy.visit('/');
    cy.signup('test@example.com', 'password');
    cy.addIncome(50);
    cy.addExpense(20, 'combustible');
    cy.verifyProfit(30);
    cy.exportCSV();
  });
});
```

---

## 📦 Dependencias Principales

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `react` | 18.x | UI library |
| `@supabase/supabase-js` | latest | Backend client |
| `motion/react` | latest | Animations |
| `lucide-react` | latest | Icons |
| `sonner` | 2.0.3 | Toast notifications |
| `tailwindcss` | 4.x | Styling |

---

## 🔄 Ciclo de Vida de una Transacción

```
1. USER INPUT
   └─> TransactionForm

2. VALIDATION
   ├─> Required: amount, date, type
   └─> Optional: category, payment_method, notes

3. SUBMISSION
   └─> useTransactions.addTransaction()

4. API CALL
   └─> supabase.from('transactions').insert([{
         user_id,      // Automático (de auth.uid())
         type,
         amount,
         date,
         category,
         payment_method,
         notes,
         created_at,   // DEFAULT NOW()
         updated_at    // DEFAULT NOW()
       }])

5. RLS CHECK
   ├─> Verifica: auth.uid() = user_id
   └─> Si falla → Error 403

6. DATABASE INSERT
   └─> PostgreSQL ejecuta INSERT

7. RESPONSE
   ├─> Success → toast.success()
   └─> Error → toast.error()

8. REFRESH DATA
   └─> fetchTransactions()

9. UPDATE UI
   ├─> TransactionList re-renders
   └─> Stats recalculated
```

---

## 🚀 Deployment Checklist

- [ ] Variables de entorno configuradas
- [ ] SQL migration ejecutada en Supabase
- [ ] RLS policies verificadas
- [ ] Email provider configurado
- [ ] CORS configurado (si es necesario)
- [ ] Analytics integrado
- [ ] Error monitoring (Sentry)
- [ ] Domain configurado
- [ ] SSL habilitado
- [ ] SEO meta tags
- [ ] PWA manifest (futuro)
- [ ] Service worker (futuro)

---

## 📈 Métricas de Código

| Métrica | Valor | Objetivo |
|---------|-------|----------|
| Componentes React | 8 | < 15 (para MVP) |
| Custom Hooks | 1 | Minimal |
| Líneas de código (total) | ~1500 | < 3000 (MVP) |
| Profundidad de componentes | 4 niveles | < 5 |
| Archivos TypeScript | 12 | Clean |
| Cobertura de tipos | 100% | Mantener |

---

*Esta arquitectura está diseñada para escalar. Para más detalles sobre mejoras futuras, ver README_TAXIMETER.md*
