# 🚀 Inicio Rápido - TaxiMeter

## ⚡ 3 Pasos para Empezar

### 1️⃣ Ejecuta la Migración SQL

Abre el SQL Editor en tu proyecto de Supabase y ejecuta el script en:
```
/supabase/migrations/001_initial_schema.sql
```

O sigue las instrucciones detalladas en: [`SETUP_INSTRUCTIONS.md`](./SETUP_INSTRUCTIONS.md)

### 2️⃣ Verifica la Configuración

Asegúrate de que:
- ✅ La tabla `transactions` existe
- ✅ Las 4 políticas RLS están activas
- ✅ El email provider está habilitado en Authentication

### 3️⃣ Prueba la Aplicación

1. **Regístrate** con un email de prueba
2. **Añade un ingreso** (botón verde flotante)
3. **Añade un gasto** (botón rojo flotante)
4. **Cambia los filtros** para ver diferentes períodos
5. **Exporta a CSV** para verificar la funcionalidad

---

## 🎯 Flujo de Usuario Típico

```
1. LOGIN → Dashboard carga con filtro "Hoy"
2. VER ESTADÍSTICAS → Ingresos: 0€, Gastos: 0€, Beneficio: 0€
3. CLICK en botón verde (💰) → Modal de ingreso
4. ESCRIBIR importe → Ej: 45.50
5. SELECCIONAR método pago → Efectivo/Tarjeta/Transferencia
6. GUARDAR → ¡Ingreso registrado!
7. REPETIR para gastos → Seleccionar categoría
8. VER ACTUALIZACIÓN INMEDIATA → Estadísticas se recalculan
9. EXPORTAR CSV → Descarga archivo para contabilidad
```

---

## 📱 Características Principales

| Característica | Descripción | Tiempo |
|---|---|---|
| **Añadir ingreso** | Click en botón verde → Importe → Guardar | < 10 seg |
| **Añadir gasto** | Click en botón rojo → Categoría → Guardar | < 10 seg |
| **Cambiar filtro** | Click en Hoy/Semana/Mes/Todo | 1 click |
| **Ver estadísticas** | Automático en dashboard | 0 clicks |
| **Exportar datos** | Click en botón descarga | 1 click |
| **Cerrar sesión** | Click en botón logout | 1 click |

---

## 🧪 Datos de Prueba Recomendados

Para probar la aplicación, añade estas transacciones:

### Ingresos
```
45.50€ - Efectivo - "Viaje centro ciudad"
67.20€ - Tarjeta - "Aeropuerto"
32.00€ - Efectivo - "Carrera corta"
```

### Gastos
```
50.00€ - Combustible - "Gasolinera Shell"
15.50€ - Comida - "Almuerzo"
3.50€ - Peajes - "AP-7"
```

**Total Ingresos**: 144.70€  
**Total Gastos**: 69.00€  
**Beneficio**: 75.70€

---

## 🐛 Solución Rápida de Problemas

### "No puedo ver mis transacciones"
→ Verifica que las políticas RLS estén activas en Supabase

### "Error al guardar"
→ Abre la consola del navegador (F12) y busca mensajes de error

### "No recibí email de confirmación"
→ Revisa spam o configura SMTP en Supabase

### "La exportación CSV está vacía"
→ Añade al menos una transacción primero

---

## 📚 Documentación Completa

Para información detallada, consulta:
- **README completo**: [`README_TAXIMETER.md`](./README_TAXIMETER.md)
- **Setup detallado**: [`SETUP_INSTRUCTIONS.md`](./SETUP_INSTRUCTIONS.md)

---

## 💡 Tips para Taxistas

1. **Registra al final de cada viaje** → Más preciso y menos olvidos
2. **Usa las notas** → Anota detalles importantes ("Viaje al aeropuerto")
3. **Exporta semanalmente** → Para tu contabilidad
4. **Revisa el filtro "Mes"** → Para ver tu rendimiento mensual
5. **Categoriza bien los gastos** → Facilita análisis futuro

---

## 🚀 ¡Listo para Producción!

Antes de lanzar públicamente:

1. ✅ Configura dominio personalizado
2. ✅ Activa HTTPS (automático en Vercel/Netlify)
3. ✅ Configura email SMTP en Supabase
4. ✅ Añade analytics (Google Analytics)
5. ✅ Configura monitoreo de errores (Sentry)
6. ✅ Crea términos de servicio y política de privacidad
7. ✅ Prueba en diferentes dispositivos móviles

---

*¿Preguntas? Revisa la documentación completa en README_TAXIMETER.md*
