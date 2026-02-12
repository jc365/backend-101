# IMPLEMENTATION PRIORITY - MULTIRESERVAS v4

## FASE 1: AUTH & CORE INFRASTRUCTURE (SEMANA 1)
### Día 1-2: Auth System Complete
1. User model (users collection)
2. Auth controller (login, register, refresh, logout)
3. JWT service (basado en legacy authMiddleware)
4. Rate limiting middleware
5. Integration tests

### Día 3: Tenant Context System
1. tenantContextMiddleware (ya tenemos)
2. Tenant model CRUD
3. Basic tenant dashboard

## FASE 2: BUSINESS MODULES (SEMANA 2)
### Día 4-5: Employee & Scheduling
1. Employee model con custom/general schedule
2. Schedule validation (employee ⊆ tenant)
3. Timezone conversion utilities

### Día 6-7: Reservation System
1. Reservation booking logic
2. Availability calculator
3. Calendar integration (FullCalendar)

## FASE 3: UI & ADVANCED SYSTEMS (SEMANA 3)
### Día 8-9: Frontend Dashboard
1. Public booking wizard
2. Tenant management UI
3. Admin multi-tenant panel

### Día 10-11: Logging & Monitoring
1. Unified logging system
2. WebSocket real-time logs
3. Error handling centralizado

## FASE 4: POLISH & DEPLOY (SEMANA 4)
### Día 12-14: Testing & Deployment
1. Complete test suite
2. Docker configuration
3. Production deployment scripts