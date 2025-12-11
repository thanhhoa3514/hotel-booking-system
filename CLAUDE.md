# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack hotel booking platform built with:
- **Backend**: NestJS 11 + Prisma 6 + PostgreSQL 15
- **Frontend**: Next.js 16 (App Router) + React 19 + Shadcn/UI
- **Validation**: Zod schemas (shared pattern across frontend/backend)
- **State**: Zustand (client state) + TanStack Query (server state)
- **Auth**: JWT with Passport.js (Local + JWT strategies)
- **Styling**: Tailwind CSS 4 with Shadcn/UI (New York variant)

## Development Commands

### Backend (NestJS)
```bash
cd backend

# Development
npm run start:dev              # Start with hot-reload (port 3001)
npm run start:debug            # Start with debugger

# Database
npx prisma generate            # Generate Prisma client
npx prisma migrate dev         # Run migrations
npx prisma db seed             # Seed database
npx prisma studio              # Open Prisma Studio

# Testing
npm run test                   # Run unit tests
npm run test:watch             # Run tests in watch mode
npm run test:e2e               # Run end-to-end tests
npm run test:cov               # Generate coverage report

# Production
npm run build                  # Build for production
npm run start:prod             # Start production server

# Code Quality
npm run lint                   # ESLint with auto-fix
npm run format                 # Prettier format
```

### Frontend (Next.js)
```bash
cd frontend

# Development
npm run dev                    # Start dev server (port 3000)

# Production
npm run build                  # Build for production
npm run start                  # Start production server

# Code Quality
npm run lint                   # ESLint check
```

## Architecture & Key Patterns

### Backend Architecture

**Module Structure**: Standard NestJS module pattern with clear separation:
- `auth/` - JWT authentication with Passport.js (JwtStrategy, LocalStrategy, Guards)
- `users/` - User management with RBAC (Role-Based Access Control)
- `rooms/` - Room and RoomType management
- `bookings/` - Booking system with multi-room support
- `payments/` - Payment processing (ready for gateway integration)
- `reviews/` - Review system with approval workflow
- `prisma/` - Database service (singleton pattern via PrismaModule)
- `redis/` - Redis service for caching
- `jwt/` - JWT utility service
- `health/` - Health check endpoints (commented out in app.module.ts)

**Prisma Patterns**:
- **PrismaModule** is imported into each feature module for database access
- Prisma Client is provided as a singleton via `PrismaService`
- All database models use UUID primary keys
- Snake_case in database, camelCase in TypeScript via `@map()` directives
- Comprehensive indexing for performance (see schema.prisma)

**Validation Strategy**:
- **Backend**: Using `nestjs-zod` for Zod integration with NestJS
- DTOs should be in `dto/*.dto.ts` files
- Frontend validation schemas can be referenced for consistency

**Authentication Flow**:
1. `LocalStrategy` validates credentials at login
2. `AuthService` generates JWT token (7-day expiration)
3. `JwtStrategy` validates token for protected routes
4. Use `@UseGuards(JwtAuthGuard)` for protected endpoints
5. Use `@UseGuards(RolesGuard)` for role-based authorization

**Logging**:
- Using `nestjs-pino` with `pino-pretty` for development
- Auto-logging enabled for all HTTP requests
- Log levels: debug (dev) / info (production)

### Frontend Architecture

**App Router Structure**:
- `app/(public)/` - Public pages (Home, Rooms, Booking flow)
- `app/auth/` - Authentication pages (Login, Register)
- `app/dashboard/` - Protected user dashboard
- Route groups with `(public)` for shared layouts

**Component Organization**:
- `components/ui/` - Shadcn/UI primitives (Button, Input, Dialog, etc.)
- `components/common/` - Layout components (Navbar, Footer)
- `components/features/` - Feature-specific components (BookingForm, RoomCard, etc.)

**State Management**:
- **TanStack Query** for server state (API calls, caching, invalidation)
- **Zustand** for client state (booking flow, UI state)
- React Hook Form + Zod for form state

**API Layer Pattern**:
- API functions in `features/*/api.ts` (e.g., `features/booking/api.ts`)
- Schemas in `features/*/schema.ts` using Zod
- Type inference: `type FormData = z.infer<typeof schema>`

**Theme System**:
- `next-themes` for dark mode (system-aware with manual toggle)
- Tailwind CSS 4 with CSS variables for theming
- Shadcn/UI New York variant

### Database Schema Highlights

**User & RBAC**:
- Users have Roles, Roles have Permissions (many-to-many via `RolePermission`)
- Permission format: `{resource}:{action}` (e.g., "booking:create", "room:delete")
- Support for social login via `UserProvider` table (Google, Facebook, Apple)
- User statuses: ACTIVE, INACTIVE, BANNED

**Room System**:
- **RoomType** defines room categories with pricing, capacity, amenities
- **Room** represents physical rooms with status tracking
- Room statuses: AVAILABLE, OCCUPIED, MAINTENANCE, CLEANING, OUT_OF_ORDER
- Dynamic pricing via **PriceCalendar** (date-specific pricing)

**Booking Flow**:
- **Booking** contains guest info, dates, pricing breakdown (subtotal, tax, service charge, discount)
- **BookingRoom** junction table for multi-room bookings with price snapshots
- Booking statuses: PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED, NO_SHOW
- Supports cancellation with reason tracking
- Source tracking (WEBSITE, PHONE, WALK_IN, OTA)

**Payment System**:
- Multiple payment methods: CASH, CREDIT_CARD, BANK_TRANSFER, MOMO, VNPAY, ZALOPAY
- Payment statuses: PENDING, COMPLETED, FAILED, REFUNDED, PARTIALLY_REFUNDED
- Gateway response stored as JSON for debugging
- Refund tracking with amount and reason

**Review System**:
- Multi-aspect ratings: overall, cleanliness, service, value, location
- Approval workflow before public display
- Hotel response capability

### Important Configuration

**Environment Variables**:

Backend:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/hotel_db"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
NODE_ENV="development"
```

Frontend:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Default Ports**:
- Backend: 3001
- Frontend: 3000
- PostgreSQL: 5432 (default)

## Development Workflow

### Database Changes
1. Modify `backend/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <migration_name>`
3. Run `npx prisma generate` to update client types
4. Update seed file if needed: `backend/prisma/seed.ts`

### Adding New Backend Module
1. Use NestJS CLI: `nest g resource <name>`
2. Import `PrismaModule` in the new module
3. Inject `PrismaService` in the service
4. Create Zod-based DTOs in `dto/` folder using `nestjs-zod`
5. Add module to `app.module.ts` imports

### Adding New Frontend Feature
1. Create feature folder: `features/<feature-name>/`
2. Add Zod schema: `<feature>.schema.ts`
3. Add API functions: `api.ts` (using axios)
4. Create components in `components/features/<feature-name>/`
5. Use TanStack Query hooks for data fetching

### Testing Patterns
- Backend: Jest with `@nestjs/testing`
- Test files: `*.spec.ts` for unit, `test/*.e2e-spec.ts` for e2e
- Tests run from `src/` directory (see jest config in package.json)

## Key Implementation Notes

- **Validation**: Frontend and backend both use Zod for type-safe validation
- **Prisma Imports**: Always import from module, not service directly (e.g., `import { PrismaModule } from 'src/prisma/prisma.module'`)
- **Room Seeding**: Seed file creates default room types and rooms for testing
- **Guards**: JWT guard protects routes, Roles guard handles permissions
- **Decimal Types**: Use Prisma's `Decimal` type for money fields, configured as `@db.Decimal(10, 2)`
- **Date Handling**: Use `date-fns` library (shared across frontend/backend)
- **Redis**: Available via `RedisService` for caching (ioredis)
- **Helmet**: Security headers enabled in production

## Common Gotchas

- **Prisma Client**: Always regenerate after schema changes with `npx prisma generate`
- **Module Imports**: Import PrismaModule, not PrismaService directly in module imports
- **Enum Validation**: Ensure Zod enums match Prisma enums exactly
- **UUID**: All primary keys use UUID v4, not auto-increment integers
- **Booking Price Snapshots**: Room prices are snapshotted in `BookingRoom.pricePerNight` to preserve historical pricing
- **Date Types**: Prisma `@db.Date` strips time, `DateTime` includes timestamp
