# Project Context

## Purpose

A modern, full-stack hotel booking and management platform that enables guests to search, book rooms, and manage reservations, while providing hotel staff with comprehensive tools for managing rooms, bookings, payments, services, and customer relationships.

Key goals:

- Provide seamless room booking experience for guests
- Enable hotel staff to manage reservations, rooms, and services efficiently
- Support payment processing through Stripe integration
- Handle service bookings (spa, restaurant, etc.) linked to room bookings
- Manage user roles and permissions (Admin, Receptionist, Guest)
- Send automated notifications and reminders

## Tech Stack

### Backend

- **Framework**: NestJS 11 (TypeScript-first, modular architecture)
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Cache/Queue**: Redis with Bull Queue for background jobs
- **Authentication**: JWT with Passport.js (Local, JWT, Google OAuth strategies)
- **Validation**: Zod schemas with nestjs-zod
- **Payment Processing**: Stripe SDK
- **File Upload**: Cloudinary
- **Notifications**: Nodemailer (email), Twilio (SMS)
- **Logging**: Pino with structured logging
- **Security**: Helmet for security headers
- **Scheduling**: @nestjs/schedule for cron jobs

### Frontend

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Components**: Shadcn/UI (New York variant)
- **State Management**: Zustand for client state, React Query (TanStack Query) for server state
- **Forms**: React Hook Form with Zod validation
- **Authentication**: Next Auth
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Notifications**: Sonner (toast notifications)
- **Icons**: Lucide React, Font Awesome

### Infrastructure

- **Containerization**: Docker Compose
- **Database**: PostgreSQL 16 Alpine
- **Cache**: Redis Alpine

## Project Conventions

### Code Style

- **Language**: TypeScript strict mode
- **Formatting**: Prettier with auto-formatting on save
- **Linting**: ESLint with TypeScript ESLint rules
- **Naming Conventions**:
  - Variables/Functions: `camelCase`
  - Classes/Interfaces: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Database columns: `snake_case` (mapped via Prisma `@map`)
  - Files: `kebab-case` for utilities, `PascalCase` for components/classes
- **Code Organization**:
  - Feature-based modules in NestJS
  - Co-located components, hooks, and utilities in frontend
  - DTOs in `dto/` subdirectories
  - Entities in `entities/` subdirectories
- **Comments**: JSDoc for public APIs, inline comments for complex logic
- **Error Messages**: Vietnamese for user-facing messages, English for technical logs

### Architecture Patterns

#### Backend (NestJS)

- **Modular Architecture**: Each feature is a self-contained module (AuthModule, BookingsModule, RoomsModule, etc.)
- **Dependency Injection**: Services injected via constructor
- **Layered Architecture**:
  - Controllers: HTTP request handling, route definitions
  - Services: Business logic, data transformation
  - Prisma Service: Database access layer
- **Guards**: JWT authentication guard, Roles guard for authorization
- **Pipes**: Zod validation pipe for DTO validation
- **Interceptors**: Transform responses, handle errors
- **Decorators**: Custom decorators for roles, public routes, current user
- **Global Modules**: ConfigModule, LoggerModule, PrismaModule

#### Frontend (Next.js)

- **App Router**: Using Next.js 16 App Router with route groups
- **Server Components**: Default, Client Components when needed (`'use client'`)
- **Feature-based Structure**: Components organized by feature
- **API Layer**: Centralized API service files (`services/*.api.ts`)
- **Custom Hooks**: Reusable logic in `hooks/`
- **Type Safety**: Shared types between frontend and backend via Zod schemas

#### Database (Prisma)

- **Schema-first**: Database schema defined in `schema.prisma`
- **Migrations**: Version-controlled migrations via Prisma Migrate
- **Relations**: Explicit relations with `onDelete` policies
- **Indexes**: Strategic indexes on frequently queried fields

### Testing Strategy

- **Backend Testing**:
  - Unit tests: Jest with `*.spec.ts` files co-located with source
  - E2E tests: Supertest for API endpoint testing
  - Test coverage: Aim for >80% coverage on critical paths
  - Mocking: Prisma client mocked in tests
- **Frontend Testing**:
  - Linting: ESLint for code quality
  - Type checking: TypeScript compiler
  - Build verification: `next build` for production readiness
- **Test Data**: Prisma seed script for development data
- **Test Environment**: Separate test database configuration

### Git Workflow

- **Branching Strategy**: Feature branches (`feature/feature-name`)
- **Commit Messages**: Conventional commits preferred
- **Pull Requests**: Required for code review before merging
- **Main Branch**: `main` for production-ready code
- **Development**: `develop` branch for integration (if used)

## Domain Context

### Core Entities

- **Users**: Hotel guests and staff with role-based access
- **Roles**: ADMIN, RECEPTIONIST, GUEST (stored in database)
- **Rooms**: Physical hotel rooms with types, pricing, capacity
- **Room Types**: Categories (Standard, Deluxe, Suite, etc.) with base pricing
- **Bookings**: Room reservations with check-in/check-out dates
- **Services**: Additional hotel services (spa, restaurant, laundry, etc.)
- **Service Bookings**: Service reservations linked to room bookings
- **Payments**: Payment records linked to bookings via Stripe
- **Reviews**: Guest reviews and ratings for rooms/services

### Business Rules

- **Booking Status Flow**: PENDING → CONFIRMED → CHECKED_IN → CHECKED_OUT → CANCELLED
- **Service Booking**: Can only be created for checked-in guests
- **Payment**: Required for booking confirmation (via Stripe)
- **Room Availability**: Calculated based on existing bookings and check-in/check-out dates
- **Pricing**: Dynamic pricing based on room type, dates, and duration
- **Notifications**: Automated emails/SMS for booking confirmations, reminders, cancellations

### Key Workflows

1. **Guest Booking Flow**: Search rooms → Select dates → Fill guest info → Create booking → Pay → Receive confirmation
2. **Service Booking Flow**: Guest checks in → Browse services → Book service → Charge to room → Service delivered
3. **Payment Flow**: Create Stripe session → Redirect to Stripe Checkout → Process payment → Webhook updates booking status
4. **Check-in Flow**: Guest arrives → Receptionist updates booking status → Room assigned → Guest can book services

## Important Constraints

- **Database**: PostgreSQL required (no SQLite for production)
- **Environment Variables**: Sensitive keys (JWT_SECRET, Stripe keys) must not be committed
- **CORS**: Configured for frontend origin only (`http://localhost:3000` in dev)
- **File Uploads**: Images uploaded to Cloudinary, not stored locally
- **Payment Processing**: Stripe test mode in development, live mode in production
- **Authentication**: JWT tokens expire after 7 days
- **Vietnamese Language**: User-facing error messages in Vietnamese
- **Type Safety**: Strict TypeScript, no `any` types (except where explicitly allowed in ESLint config)

## External Dependencies

### Payment Processing

- **Stripe**: Payment gateway for booking payments
  - Test mode: `sk_test_*` and `pk_test_*` keys
  - Webhook endpoint: `/stripe/webhook` for payment status updates
  - Required events: `checkout.session.completed`, `checkout.session.expired`

### File Storage

- **Cloudinary**: Image upload and CDN for room/service images
  - Folder structure: `hotel-management/`
  - Image transformations: Auto-optimization, width limits

### Communication

- **Nodemailer**: Email notifications (booking confirmations, reminders)
  - Templates: Handlebars templates in `notifications/templates/`
- **Twilio**: SMS notifications (optional, configured but may not be active)

### Infrastructure

- **Redis**: Used for Bull Queue (background jobs) and caching
  - Port: 6379
  - Persistence: Enabled with save interval
- **PostgreSQL**: Primary database
  - Port: 5432
  - Connection: Via Prisma Client

### Development Tools

- **Stripe CLI**: Required for local webhook testing (`stripe listen`)
- **Docker Compose**: For local PostgreSQL and Redis instances
