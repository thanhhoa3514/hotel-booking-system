# 🏨 Hotel Booking Platform

A modern, full-stack hotel booking platform built with **Next.js 16**, **NestJS**, **Prisma**, and **PostgreSQL**.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-11-red?logo=nestjs)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)

## ✨ Features

### Frontend
- 🎨 **Modern UI** - Built with Shadcn/UI components and Tailwind CSS
- 🌙 **Dark Mode** - System-aware theme with manual toggle
- 📱 **Responsive Design** - Mobile-first approach
- ⚡ **Animations** - Smooth transitions and micro-interactions
- 🔍 **Room Search** - Filter by price, capacity, and availability
- 📋 **Booking Wizard** - Multi-step booking flow with progress indicator
- 📊 **Dashboard** - View and manage your bookings

### Backend
- 🔐 **Authentication** - JWT-based with Passport.js
- 👥 **User Management** - Full CRUD with role-based access
- 🏠 **Room Management** - Room types, pricing, and availability
- 📅 **Booking System** - Complete reservation workflow
- 💳 **Payments** - Ready for payment gateway integration
- 📝 **Validation** - Zod schemas for type-safe DTOs

## 📁 Project Structure

```
hotelmanagement/
├── frontend/                 # Next.js 16 Application
│   ├── app/                  # App Router pages
│   │   ├── (public)/         # Public pages (Home, Rooms, Booking)
│   │   ├── auth/             # Authentication pages
│   │   └── dashboard/        # User dashboard
│   ├── components/           # React components
│   │   ├── common/           # Layout components (Navbar, Footer)
│   │   ├── features/         # Feature-specific components
│   │   └── ui/               # Shadcn/UI components
│   └── features/             # Business logic (schemas, hooks)
│
├── backend/                  # NestJS Application
│   ├── src/
│   │   ├── auth/             # Authentication module
│   │   ├── users/            # User management
│   │   ├── rooms/            # Room & RoomType management
│   │   ├── bookings/         # Booking management
│   │   ├── payments/         # Payment processing
│   │   └── prisma/           # Database service
│   └── prisma/
│       └── schema.prisma     # Database schema
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- pnpm or npm

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/hotel-booking-system.git
cd hotel-booking-system
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/hotel_db"
JWT_SECRET="your-super-secret-jwt-key"
```

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed

# Start the development server
npm run start:dev
```

Backend will be available at `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

```bash
# Start the development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Coverage report
```

### Frontend Tests
```bash
cd frontend
npm run lint          # ESLint
npm run build         # Type checking
```

## 📚 API Documentation

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/users` | GET | List all users |
| `/users/:id` | GET | Get user by ID |
| `/users` | POST | Create user |
| `/users/:id` | PATCH | Update user |
| `/users/:id` | DELETE | Delete user |
| `/rooms` | GET | List all rooms |
| `/room-types` | GET | List room types |
| `/bookings` | POST | Create booking |

## 🎨 UI Components

This project uses [Shadcn/UI](https://ui.shadcn.com) with the **New York** style variant. Available components:
- Button, Input, Label
- Card, Dialog, Popover
- Calendar, DatePicker
- Select, Checkbox, Slider
- Table, Tabs, Progress
- Badge, Avatar, Skeleton
- Sonner (Toast notifications)

## 🔧 Environment Variables

### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `PORT` | Server port | 3001 |

### Frontend
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | http://localhost:3001 |

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ using Next.js, NestJS, and Shadcn/UI
