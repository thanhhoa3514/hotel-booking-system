# Hướng dẫn Backend: Prisma & Zod (Hotel Management System)

Tài liệu này cung cấp cái nhìn tổng quan về cách hệ thống Backend của bạn sử dụng **Prisma** để quản lý cơ sở dữ liệu và **Zod** để xác thực dữ liệu trong NestJS.

---

## 1. Prisma: Database Management

Prisma là một ORM hiện đại giúp bạn tương tác với cơ sở dữ liệu một cách an toàn (Type-safe).

### Cấu trúc file `schema.prisma`
File này nằm tại `backend/prisma/schema.prisma`. Nó định nghĩa:
- **Datasource**: Kết nối tới PostgreSQL.
- **Generator**: Tạo ra Prisma Client cho TypeScript.
- **Models**: Các bảng trong cơ sở dữ liệu (User, Room, Booking, v.v.).

### Các lệnh Prisma quan trọng
- `npx prisma generate`: Tạo lại Prisma Client sau khi thay đổi schema.
- `npx prisma migrate dev`: Tạo và áp dụng bản migration mới khi thay đổi schema (Môi trường Development).
- `npx prisma db push`: Đẩy trực tiếp schema lên DB mà không tạo migration (Dùng cho prototype nhanh).
- `npx prisma studio`: Mở giao diện đồ họa để quản lý dữ liệu.

---

## 2. Zod: Data Validation

Zod được sử dụng để đảm bảo dữ liệu đầu vào (Request Body, Query Params) luôn đúng định dạng trước khi xử lý trong Service.

### NestJS + Zod integration
Trong dự án này, chúng ta sử dụng `nestjs-zod` để kết hợp sức mạnh của Zod với NestJS DTOs.

### Ví dụ về DTO (Data Transfer Object)
Dưới đây là cách định nghĩa một DTO sử dụng Zod:

```typescript
import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export const CreateUserSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  fullName: z.string().min(1, 'Họ tên không được để trống'),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
```

---

## 3. Workflow hoàn chỉnh: Từ Request đến Database

### Bước 1: Định nghĩa Schema trong `schema.prisma`
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  fullName  String   @map("full_name")
  // ...
}
```

### Bước 2: Tạo DTO với Zod
Định nghĩa các quy tắc kiểm tra dữ liệu đầu vào.

### Bước 3: Sử dụng trong Controller
NestJS sẽ tự động kiểm tra dữ liệu dựa trên schema của Zod.

```typescript
@Post()
@UsePipes(ZodValidationPipe)
async create(@Body() createUserDto: CreateUserDto) {
  return this.usersService.create(createUserDto);
}
```

### Bước 4: Xử lý trong Service với Prisma
```typescript
async create(data: CreateUserDto) {
  return this.prisma.user.create({
    data: {
      email: data.email,
      fullName: data.fullName,
      // ...
    }
  });
}
```

---

## 4. Best Practices
1. **Naming Convention**: Sử dụng `camelCase` cho field trong model và `snake_case` khi map xuống database bằng `@map`.
2. **Indexing**: Luôn thêm `@@index` cho các trường thường xuyên dùng để tìm kiếm (như `email`, `status`).
3. **Validation**: Validate mọi dữ liệu từ client bằng Zod để tránh lỗi logic và bảo mật.
4. **Relational Integrity**: Sử dụng `onDelete: Cascade` hoặc `onDelete: Restrict` một cách cẩn thận.

---

*Tài liệu này được tạo ra để hỗ trợ quá trình học tập và phát triển hệ thống Hotel Management.*
