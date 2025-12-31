# AI Coding Guidelines for crud-ionic-sqlite

## Overview
This is an Ionic Angular mobile app for agricultural management with CRUD operations for entities like sales (ventas), harvests (cosechas), workers (obreros), tools (herramientas), etc. Uses Capacitor SQLite for local storage with sync to remote server.

## Architecture
- **Framework**: Angular 16 + Ionic 7 + Capacitor 5
- **Navigation**: Tabs-based with guards (AuthGuard for protected routes, LoginGuard for login)
- **State**: Local storage for auth, SQLite for data
- **Sync**: Bidirectional sync with remote API (localhost:8080) using sync flags

## Data Layer
- **Storage**: Capacitor SQLite with soft deletes (`deleted_at`), audit fields (`created_at`, `updated_at`), sync fields (`is_synced`, `synced_at`)
- **IDs**: UUID v4 for all records
- **Base Service**: `CrudGenericService` provides create/readAll/getById/update/delete with automatic audit/sync handling
- **Platform Handling**: Saves to web store on web, requests permissions on Android

## Services Pattern
- Each entity has a service extending `CrudGenericService` (e.g., `VentasService`)
- Complex operations like `createWithDetails` for master-detail relationships (e.g., sales with harvest details)
- Inject `CrudGenericService` and call its methods with table name

## Forms and Calculations
- Use `ngModel` for two-way binding in Ionic forms
- Complex calculations: Proportional distribution of weights/totals across details (see `FormVentasPage.recalcular()`)
- State-dependent logic: Fresh vs dry calculations based on `estado_humedad`

## Sync
- `SyncService.syncTable()` syncs unsynced records to remote API
- Handles create/update/delete operations
- Marks records as synced after success

## Build & Deploy
- **Web**: `ng serve` (port 4200)
- **Mobile**: `ng build` → `npx cap sync android` → `npx cap run android`
- **Test**: `ng test` (Karma)
- **Lint**: `ng lint`

## Conventions
- **Table Names**: Spanish (ventas, cosechas, obreros)
- **File Structure**: `pages/` for routes, `services/` for data, `guards/` for auth
- **Soft Deletes**: Always check `deleted_at IS NULL` in queries
- **Audit**: Update `updated_at` on changes, set `is_synced = 0`
- **Error Handling**: Console.error for sync failures, no global error boundaries

## Key Files
- `services/crud-generic.service.ts`: Base CRUD with audit/sync
- `services/sqlite.service.ts`: DB init from `assets/db/db.json`
- `pages/ventas/form-ventas/`: Example complex form with calculations
- `guards/auth.guard.ts`: Simple localStorage auth