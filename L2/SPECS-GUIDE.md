# GUÍA DE ESPECIFICACIONES - MULTIRESERVAS v4

## ESTRUCTURA DE ARCHIVOS
multireservas-specs-v4/
├── SPECS-GUIDE.md # Este archivo
├── docs/
│ ├── foundation/core/ # Modelos de datos
│ │ ├── tenant-model.yaml # Modelo Tenant
│ │ ├── employee-model.yaml # Modelo Employee
│ │ ├── reservation-model.yaml # Modelo Reservation
│ │ ├── service-model.yaml # Modelo Service
│ │ └── client-model.yaml # Modelo Client
│ │
│ ├── foundation/business-rules/ # Reglas de negocio
│ │ ├── scheduling-rules.yaml # Reglas de scheduling
│ │ ├── time-validation.yaml # Validación de tiempos
│ │ ├── days-validation.yaml # Validación de días
│ │ └── inheritance-rules.yaml # Reglas de herencia
│ │
│ ├── technical/ # Implementación técnica
│ │ ├── auth-system/ # Sistema de autenticación
│ │ │ ├── jwt-specification.yaml
│ │ │ ├── middleware-patterns.yaml
│ │ │ └── security-rules.yaml
│ │ │
│ │ ├── scheduling/ # Scheduling patterns
│ │ ├── timezone-handling.yaml # Manejo de timezones
│ │ ├── project-structure.yaml # Estructura de proyecto
│ │ └── error-handling.yaml # Manejo de errores
│ │
│ ├── methodology/ # Metodología de trabajo
│ │ ├── development-workflow.yaml # Flujo de desarrollo
│ │ ├── code-generation-rules.yaml# Reglas para AI
│ │ ├── ai-prompting-guide.yaml # Guía de prompts
│ │ └── implementation-priority.md# Prioridades
│ │
│ └── features/ # Features específicas
│ ├── tenant-context-test.yaml # Feature de prueba
│ ├── TEMPLATE-feature.yaml # Plantilla
│ ├── auth-module.yaml # Módulo auth
│ └── employee-crud.yaml # CRUD employees
│
├── examples/ # Ejemplos de código
│ ├── models/ # Modelos de ejemplo
│ │ ├── Tenant.js
│ │ └── Employee.js
│ │
│ ├── legacy-to-new/ # Migración legacy
│ │ └── auth-middleware-legacy.js
│ │
│ ├── validations/ # Validaciones
│ │ └── test-schedule-validation.js
│ │
│ └── README.md # Instrucciones
│
└── scripts/ # Scripts de utilidad
├── validate-specs.js # Validador
├── setup-project.sh # Setup proyecto
└── MIGRATION-GUIDE.md # Guía migración

text

## CÓMO USAR

1. **Llena los archivos YAML** con tus especificaciones
2. **Usa la estructura** para generar código con AI
3. **Mantén coherencia** entre archivos relacionados

## ARCHIVOS CLAVE PARA COMENZAR

1. `docs/foundation/core/tenant-model.yaml` - Modelo principal
2. `docs/technical/auth-system/jwt-specification.yaml` - Autenticación
3. `docs/methodology/implementation-priority.md` - Roadmap
4. `docs/features/tenant-context-test.yaml` - Primera feature
5. `docs/methodology/code-generation-rules.yaml` - Reglas para AI

## 🏗️ SISTEMAS CENTRALIZADOS (CORE SYSTEMS)

### 📋 Estado Actual:

#### ✅ IMPLEMENTADO (Fase 1):
- **Sistema de Configuración Centralizada**
  - Archivo: `docs/technical/observability/configuration-system.yaml`
  - Código: `src/core/config/`
  - Características:
    * ConfigManager como único punto de verdad
    * Múltiples fuentes (Base de datos > Variables entorno > Valores por defecto)
    * Cambio en caliente via base de datos
    * Configuración pública para frontend (/api/config/public)
    * Headers automáticos en cada respuesta

#### 🔜 PRÓXIMOS (Fase 2):
- **Sistema de Errores Centralizado** - `error-handling-system.yaml`
- **Sistema de Logging Unificado** - `logging-system.yaml`
- **Sistema de Debug Integrado** - `debug-system.yaml`

### 📁 Estructura de Implementación:
    src/
    ├── config/ # Configuración de conexiones externas
    │ └── database.js # ✅ Usa ConfigManager, NO process.env
    ├── core/ # ✅ Sistemas centralizados (ES Modules obligatorio)
    │ ├── config/ # ✅ Sistema de configuración
    │ ├── errors/ # 🔜 Sistema de errores
    │ ├── logging/ # 🔜 Sistema de logging
    │ └── debug/ # 🔜 Sistema de debug
    └── [módulos] # Código de aplicación (CommonJS temporalmente)

### ⚡ Convenciones Rápidas:

    1. **Para nuevo código en `src/core/`**:
    // ✅ CORRECTO
    import config from './core/config/index.js';
    const value = config.get('KEY', 'default');
    
    // ❌ INCORRECTO
    const value = process.env.KEY; // NUNCA en src/core/
    Para código existente:

    // ✅ MIGRAR GRADUALMENTE
    const value = req.config?.get('KEY') || process.env.KEY;

### Archivos .env:

    .env                   # Valores base (committed)
    .env.local             # Overrides locales (gitignored)
    .env.production        # Producción
    .env.development       # Desarrollo