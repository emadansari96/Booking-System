import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Create User
    console.log('👤 Creating user...');
    const hashedPassword = await bcrypt.hash('booking_password', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'admin@booking.com',
        firstName: 'Admin',
        lastName: 'User',
        phone: '+989218033407h
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
    });
    console.log(`✅ User created with ID: ${user.id}`);

    // 2. Create Commission Strategy
    console.log('💰 Creating commission strategy...');
    const commissionStrategy = await prisma.commissionStrategy.create({
      data: {
        name: 'Standard Commission',
        description: 'Standard commission for all bookings',
        type: 'PERCENTAGE',
        value: 10.0,
        priority: 1,
        applicableResourceTypes: ['HOTEL', 'APARTMENT'],
        minBookingDuration: 1,
        maxBookingDuration: 30,
        isActive: true,
      },
    });
    console.log(`✅ Commission strategy created with ID: ${commissionStrategy.id}`);

    // 3. Create Resource
    console.log('🏨 Creating resource...');
    const resource = await prisma.resource.create({
      data: {
        name: 'Paradise Hotel',
        description: 'Luxury hotel with amazing views of the city',
        type: 'HOTEL',
        location: 'Tehran, Iran',
        capacity: 100,
        price: 200.00,
        currency: 'USD',
        status: 'AVAILABLE',
        amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Spa'],
        images: ['https://example.com/hotel1.jpg', 'https://example.com/hotel2.jpg'],
        isActive: true,
      },
    });
    console.log(`✅ Resource created with ID: ${resource.id}`);

    // 4. Create Resource Item
    console.log('🛏️ Creating resource item...');
    const resourceItem = await prisma.resourceItem.create({
      data: {
        resourceId: resource.id,
        name: 'Deluxe Suite',
        description: 'Spacious suite with city view and modern amenities',
        type: 'ROOM',
        capacity: 4,
        price: 300.00,
        currency: 'USD',
        status: 'AVAILABLE',
        location: 'Floor 10',
        amenities: ['WiFi', 'TV', 'Mini Bar', 'Balcony', 'Jacuzzi'],
        images: ['https://example.com/suite1.jpg', 'https://example.com/suite2.jpg'],
        isActive: true,
      },
    });
    console.log(`✅ Resource item created with ID: ${resourceItem.id}`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`👤 User: ${user.email} (${user.role})`);
    console.log(`💰 Commission Strategy: ${commissionStrategy.name} (${commissionStrategy.value}%)`);
    console.log(`🏨 Resource: ${resource.name} (${resource.type})`);
    console.log(`🛏️ Resource Item: ${resourceItem.name} (${resourceItem.type})`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('💥 Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
