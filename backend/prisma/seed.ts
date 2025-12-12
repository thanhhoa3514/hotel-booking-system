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

  // Create Sample Services
  console.log('📝 Creating sample services...');

  const services = await Promise.all([
    // Food & Beverage
    prisma.service.upsert({
      where: { slug: 'breakfast-buffet' },
      update: {},
      create: {
        name: 'Buffet Sáng',
        slug: 'breakfast-buffet',
        description: 'Buffet sáng phong phú với đa dạng món Âu - Á',
        category: 'FOOD_BEVERAGE',
        pricingType: 'PER_PERSON',
        basePrice: 150000,
        isActive: true,
        requiresBooking: false,
        operatingHours: {
          monday: { open: '06:00', close: '10:00' },
          tuesday: { open: '06:00', close: '10:00' },
          wednesday: { open: '06:00', close: '10:00' },
          thursday: { open: '06:00', close: '10:00' },
          friday: { open: '06:00', close: '10:00' },
          saturday: { open: '06:00', close: '11:00' },
          sunday: { open: '06:00', close: '11:00' },
        },
        displayOrder: 1,
      },
    }),
    prisma.service.upsert({
      where: { slug: 'room-service-coffee' },
      update: {},
      create: {
        name: 'Cà phê phục vụ tại phòng',
        slug: 'room-service-coffee',
        description: 'Cà phê và trà cao cấp giao tận phòng',
        category: 'ROOM_SERVICE',
        pricingType: 'PER_ITEM',
        basePrice: 50000,
        isActive: true,
        requiresBooking: false,
        operatingHours: {
          monday: { open: '06:00', close: '23:00' },
          tuesday: { open: '06:00', close: '23:00' },
          wednesday: { open: '06:00', close: '23:00' },
          thursday: { open: '06:00', close: '23:00' },
          friday: { open: '06:00', close: '23:00' },
          saturday: { open: '06:00', close: '23:00' },
          sunday: { open: '06:00', close: '23:00' },
        },
        displayOrder: 2,
      },
    }),

    // Spa & Wellness
    prisma.service.upsert({
      where: { slug: 'massage-60min' },
      update: {},
      create: {
        name: 'Massage thư giãn (60 phút)',
        slug: 'massage-60min',
        description: 'Massage toàn thân với tinh dầu thư giãn',
        category: 'SPA_WELLNESS',
        pricingType: 'FIXED',
        basePrice: 500000,
        isActive: true,
        requiresBooking: true,
        maxCapacity: 4,
        duration: 60,
        operatingHours: {
          monday: { open: '09:00', close: '21:00' },
          tuesday: { open: '09:00', close: '21:00' },
          wednesday: { open: '09:00', close: '21:00' },
          thursday: { open: '09:00', close: '21:00' },
          friday: { open: '09:00', close: '22:00' },
          saturday: { open: '09:00', close: '22:00' },
          sunday: { open: '09:00', close: '21:00' },
        },
        displayOrder: 3,
      },
    }),
    prisma.service.upsert({
      where: { slug: 'spa-package' },
      update: {},
      create: {
        name: 'Gói Spa Cao Cấp (90 phút)',
        slug: 'spa-package',
        description: 'Gói trọn gói: massage + chăm sóc da mặt + ngâm chân',
        category: 'SPA_WELLNESS',
        pricingType: 'FIXED',
        basePrice: 800000,
        isActive: true,
        requiresBooking: true,
        maxCapacity: 2,
        duration: 90,
        operatingHours: {
          monday: { open: '10:00', close: '20:00' },
          tuesday: { open: '10:00', close: '20:00' },
          wednesday: { open: '10:00', close: '20:00' },
          thursday: { open: '10:00', close: '20:00' },
          friday: { open: '10:00', close: '20:00' },
          saturday: { open: '10:00', close: '20:00' },
          sunday: { open: '10:00', close: '20:00' },
        },
        displayOrder: 4,
      },
    }),

    // Recreation
    prisma.service.upsert({
      where: { slug: 'gym-access' },
      update: {},
      create: {
        name: 'Phòng Gym',
        slug: 'gym-access',
        description: 'Sử dụng phòng gym với thiết bị hiện đại',
        category: 'RECREATION',
        pricingType: 'PER_HOUR',
        basePrice: 100000,
        isActive: true,
        requiresBooking: false,
        maxCapacity: 10,
        operatingHours: {
          monday: { open: '05:00', close: '22:00' },
          tuesday: { open: '05:00', close: '22:00' },
          wednesday: { open: '05:00', close: '22:00' },
          thursday: { open: '05:00', close: '22:00' },
          friday: { open: '05:00', close: '22:00' },
          saturday: { open: '06:00', close: '22:00' },
          sunday: { open: '06:00', close: '22:00' },
        },
        displayOrder: 5,
      },
    }),
    prisma.service.upsert({
      where: { slug: 'pool-access' },
      update: {},
      create: {
        name: 'Hồ Bơi',
        slug: 'pool-access',
        description: 'Hồ bơi ngoài trời với view đẹp',
        category: 'RECREATION',
        pricingType: 'FIXED',
        basePrice: 200000,
        isActive: true,
        requiresBooking: false,
        maxCapacity: 30,
        operatingHours: {
          monday: { open: '06:00', close: '20:00' },
          tuesday: { open: '06:00', close: '20:00' },
          wednesday: { open: '06:00', close: '20:00' },
          thursday: { open: '06:00', close: '20:00' },
          friday: { open: '06:00', close: '21:00' },
          saturday: { open: '06:00', close: '21:00' },
          sunday: { open: '06:00', close: '21:00' },
        },
        displayOrder: 6,
      },
    }),

    // Transportation
    prisma.service.upsert({
      where: { slug: 'airport-pickup' },
      update: {},
      create: {
        name: 'Đón sân bay',
        slug: 'airport-pickup',
        description: 'Dịch vụ đón tiễn sân bay bằng xe riêng',
        category: 'TRANSPORTATION',
        pricingType: 'FIXED',
        basePrice: 300000,
        isActive: true,
        requiresBooking: true,
        operatingHours: {
          monday: { open: '00:00', close: '23:59' },
          tuesday: { open: '00:00', close: '23:59' },
          wednesday: { open: '00:00', close: '23:59' },
          thursday: { open: '00:00', close: '23:59' },
          friday: { open: '00:00', close: '23:59' },
          saturday: { open: '00:00', close: '23:59' },
          sunday: { open: '00:00', close: '23:59' },
        },
        displayOrder: 7,
      },
    }),

    // Laundry
    prisma.service.upsert({
      where: { slug: 'laundry-service' },
      update: {},
      create: {
        name: 'Giặt ủi',
        slug: 'laundry-service',
        description: 'Dịch vụ giặt ủi nhanh trong ngày',
        category: 'LAUNDRY',
        pricingType: 'PER_ITEM',
        basePrice: 30000,
        isActive: true,
        requiresBooking: false,
        operatingHours: {
          monday: { open: '08:00', close: '18:00' },
          tuesday: { open: '08:00', close: '18:00' },
          wednesday: { open: '08:00', close: '18:00' },
          thursday: { open: '08:00', close: '18:00' },
          friday: { open: '08:00', close: '18:00' },
          saturday: { open: '08:00', close: '17:00' },
          sunday: { isClosed: true },
        },
        displayOrder: 8,
      },
    }),

    // Business
    prisma.service.upsert({
      where: { slug: 'meeting-room' },
      update: {},
      create: {
        name: 'Phòng họp',
        slug: 'meeting-room',
        description: 'Phòng họp với thiết bị projector và whiteboard',
        category: 'BUSINESS',
        pricingType: 'PER_HOUR',
        basePrice: 200000,
        isActive: true,
        requiresBooking: true,
        maxCapacity: 12,
        operatingHours: {
          monday: { open: '08:00', close: '18:00' },
          tuesday: { open: '08:00', close: '18:00' },
          wednesday: { open: '08:00', close: '18:00' },
          thursday: { open: '08:00', close: '18:00' },
          friday: { open: '08:00', close: '18:00' },
          saturday: { isClosed: true },
          sunday: { isClosed: true },
        },
        displayOrder: 9,
      },
    }),
  ]);

  console.log(`✅ Created ${services.length} sample services`);

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
