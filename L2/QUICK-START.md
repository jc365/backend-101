# INICIO RÁPIDO

## 1. LLENA ESTOS 5 ARCHIVOS PRIMERO:

1. **Modelo Tenant**: `docs/foundation/core/tenant-model.yaml`
   - Define campos: name, email, timezone, general_schedule

2. **JWT Specs**: `docs/technical/auth-system/jwt-specification.yaml`
   - Define estructura del token: {userId, tenantId, role}

3. **Auth Middleware**: `docs/technical/auth-system/middleware-patterns.yaml`
   - Define cómo validar tokens y extraer tenantId

4. **Reglas de Scheduling**: `docs/foundation/business-rules/scheduling-rules.yaml`
   - Define: employee schedule ⊆ tenant schedule

5. **Feature de prueba**: `docs/features/tenant-context-test.yaml`
   - Define endpoint GET /api/test/tenant-context

## 2. GENERA CÓDIGO CON AI:

Usa prompt como:
"Genera el modelo Tenant.js basado en docs/foundation/core/tenant-model.yaml"

text

## 3. VALIDA:

```bash
# Navega a la estructura
cd multireservas-specs-v4

# Verifica que todos los archivos existen
find . -name "*.yaml" | wc -l
# Deberías ver 20+ archivos YAML
4. ITERA:
Llena spec

Genera código

Prueba

Ajusta spec

Repite
