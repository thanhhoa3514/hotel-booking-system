import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Roles
  console.log('📝 Creating roles...');
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: {
        name: 'ADMIN',
        description: 'Quản trị viên hệ thống',
      },
    }),
    prisma.role.upsert({
      where: { name: 'MANAGER' },
      update: {},
      create: {
        name: 'MANAGER',
        description: 'Quản lý khách sạn',
      },
    }),
    prisma.role.upsert({
      where: { name: 'RECEPTIONIST' },
      update: {},
      create: {
        name: 'RECEPTIONIST',
        description: 'Lễ tân',
      },
    }),
    prisma.role.upsert({
      where: { name: 'HOUSEKEEPING' },
      update: {},
      create: {
        name: 'HOUSEKEEPING',
        description: 'Nhân viên dọn phòng',
      },
    }),
    prisma.role.upsert({
      where: { name: 'GUEST' },
      update: {},
      create: {
        name: 'GUEST',
        description: 'Khách hàng',
      },
    }),
  ]);

  console.log(`✅ Created ${roles.length} roles`);

  // Create Permissions
  console.log('📝 Creating permissions...');
  const permissionData = [
    // Booking permissions
    { action: 'create', resource: 'booking', slug: 'booking:create', description: 'Tạo đặt phòng' },
    { action: 'read', resource: 'booking', slug: 'booking:read', description: 'Xem đặt phòng' },
    { action: 'update', resource: 'booking', slug: 'booking:update', description: 'Cập nhật đặt phòng' },
    { action: 'delete', resource: 'booking', slug: 'booking:delete', description: 'Hủy đặt phòng' },
    { action: 'manage', resource: 'booking', slug: 'booking:manage', description: 'Quản lý đặt phòng' },

    // Room permissions
    { action: 'create', resource: 'room', slug: 'room:create', description: 'Tạo phòng' },
    { action: 'read', resource: 'room', slug: 'room:read', description: 'Xem phòng' },
    { action: 'update', resource: 'room', slug: 'room:update', description: 'Cập nhật phòng' },
    { action: 'delete', resource: 'room', slug: 'room:delete', description: 'Xóa phòng' },

    // User permissions
    { action: 'create', resource: 'user', slug: 'user:create', description: 'Tạo người dùng' },
    { action: 'read', resource: 'user', slug: 'user:read', description: 'Xem người dùng' },
    { action: 'update', resource: 'user', slug: 'user:update', description: 'Cập nhật người dùng' },
    { action: 'delete', resource: 'user', slug: 'user:delete', description: 'Xóa người dùng' },

    // Price permissions
    { action: 'manage', resource: 'price', slug: 'price:manage', description: 'Quản lý giá phòng' },

    // Report permissions
    { action: 'read', resource: 'report', slug: 'report:read', description: 'Xem báo cáo' },
  ];

  const permissions = await Promise.all(
    permissionData.map((p) =>
      prisma.permission.upsert({
        where: { slug: p.slug },
        update: {},
        create: p,
      }),
    ),
  );

  console.log(`✅ Created ${permissions.length} permissions`);

  // Assign permissions to roles
  console.log('📝 Assigning permissions to roles...');

  const adminRole = roles.find((r) => r.name === 'ADMIN');
  const managerRole = roles.find((r) => r.name === 'MANAGER');
  const receptionistRole = roles.find((r) => r.name === 'RECEPTIONIST');
  const housekeepingRole = roles.find((r) => r.name === 'HOUSEKEEPING');
  const guestRole = roles.find((r) => r.name === 'GUEST');

  // ADMIN: All permissions
  if (adminRole) {
    await Promise.all(
      permissions.map((p) =>
        prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: adminRole.id,
              permissionId: p.id,
            },
          },
          update: {},
          create: {
            roleId: adminRole.id,
            permissionId: p.id,
          },
        }),
      ),
    );
  }

  // MANAGER: Manage bookings, rooms, prices, read reports
  if (managerRole) {
    const managerPermissions = permissions.filter((p) =>
      ['booking:manage', 'room:create', 'room:read', 'room:update', 'price:manage', 'report:read'].includes(p.slug),
    );
    await Promise.all(
      managerPermissions.map((p) =>
        prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: managerRole.id,
              permissionId: p.id,
            },
          },
          update: {},
          create: {
            roleId: managerRole.id,
            permissionId: p.id,
          },
        }),
      ),
    );
  }

  // RECEPTIONIST: Manage bookings, read rooms
  if (receptionistRole) {
    const receptionistPermissions = permissions.filter((p) =>
      ['booking:create', 'booking:read', 'booking:update', 'booking:manage', 'room:read'].includes(p.slug),
    );
    await Promise.all(
      receptionistPermissions.map((p) =>
        prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: receptionistRole.id,
              permissionId: p.id,
            },
          },
          update: {},
          create: {
            roleId: receptionistRole.id,
            permissionId: p.id,
          },
        }),
      ),
    );
  }

  // HOUSEKEEPING: Read rooms
  if (housekeepingRole) {
    const housekeepingPermissions = permissions.filter((p) =>
      ['room:read', 'room:update'].includes(p.slug),
    );
    await Promise.all(
      housekeepingPermissions.map((p) =>
        prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: housekeepingRole.id,
              permissionId: p.id,
            },
          },
          update: {},
          create: {
            roleId: housekeepingRole.id,
            permissionId: p.id,
          },
        }),
      ),
    );
  }

  // GUEST: Create and read own bookings, read rooms
  if (guestRole) {
    const guestPermissions = permissions.filter((p) =>
      ['booking:create', 'booking:read', 'room:read'].includes(p.slug),
    );
    await Promise.all(
      guestPermissions.map((p) =>
        prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: guestRole.id,
              permissionId: p.id,
            },
          },
          update: {},
          create: {
            roleId: guestRole.id,
            permissionId: p.id,
          },
        }),
      ),
    );
  }

  console.log('✅ Assigned permissions to roles');

  // Create sample room types
  console.log('📝 Creating sample room types...');
  const roomTypes = await Promise.all([
    prisma.roomType.upsert({
      where: { name: 'Standard' },
      update: {},
      create: {
        name: 'Standard',
        slug: 'standard',
        description: 'Phòng tiêu chuẩn với đầy đủ tiện nghi cơ bản',
        basePrice: 500000,
        capacity: 2,
        bedType: 'SINGLE',
        size: 25,
        amenities: ['WiFi', 'TV', 'Điều hòa', 'Tủ lạnh'],
      },
    }),
    prisma.roomType.upsert({
      where: { name: 'Deluxe' },
      update: {},
      create: {
        name: 'Deluxe',
        slug: 'deluxe',
        description: 'Phòng cao cấp với view đẹp',
        basePrice: 800000,
        capacity: 2,
        bedType: 'QUEEN',
        size: 35,
        amenities: ['WiFi', 'TV', 'Điều hòa', 'Tủ lạnh', 'Ban công', 'Minibar'],
      },
    }),
    prisma.roomType.upsert({
      where: { name: 'Suite' },
      update: {},
      create: {
        name: 'Suite',
        slug: 'suite',
        description: 'Phòng suite sang trọng với phòng khách riêng',
        basePrice: 1500000,
        capacity: 4,
        bedType: 'KING',
        size: 60,
        amenities: [
          'WiFi',
          'TV',
          'Điều hòa',
          'Tủ lạnh',
          'Ban công',
          'Minibar',
          'Phòng khách',
          'Bồn tắm',
        ],
      },
    }),
  ]);

  console.log(`✅ Created ${roomTypes.length} room types`);

  // Create sample rooms
  console.log('📝 Creating sample rooms...');
  const standardType = roomTypes[0];
  const deluxeType = roomTypes[1];
  const suiteType = roomTypes[2];

  const rooms: Promise<any>[] = [];

  // Create 5 standard rooms (floor 1)
  for (let i = 1; i <= 5; i++) {
    rooms.push(
      prisma.room.upsert({
        where: { roomNumber: `10${i}` },
        update: {},
        create: {
          roomNumber: `10${i}`,
          floor: 1,
          status: 'AVAILABLE',
          typeId: standardType.id,
        },
      }),
    );
  }

  // Create 5 deluxe rooms (floor 2)
  for (let i = 1; i <= 5; i++) {
    rooms.push(
      prisma.room.upsert({
        where: { roomNumber: `20${i}` },
        update: {},
        create: {
          roomNumber: `20${i}`,
          floor: 2,
          status: 'AVAILABLE',
          typeId: deluxeType.id,
        },
      }),
    );
  }

  // Create 3 suite rooms (floor 3)
  for (let i = 1; i <= 3; i++) {
    rooms.push(
      prisma.room.upsert({
        where: { roomNumber: `30${i}` },
        update: {},
        create: {
          roomNumber: `30${i}`,
          floor: 3,
          status: 'AVAILABLE',
          typeId: suiteType.id,
        },
      }),
    );
  }

  await Promise.all(rooms);
  console.log(`Created ${rooms.length} rooms`);

  // Create Admin User
  console.log(' Creating admin user...');


  if (adminRole) {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    await prisma.user.upsert({
      where: { email: 'admin@stayzy.vn' },
      update: {},
      create: {
        email: 'admin@stayzy.vn',
        password: hashedPassword,
        fullName: 'Admin Stayzy',
        phone: '0123456789',
        roleId: adminRole.id,
        status: 'ACTIVE',
      },
    });


  }

  console.log(' Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(' Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
