// scripts/create-admin.js
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('your_password', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'مدیر سیستم',
      phone: '09123456789',
      password: hashedPassword,
      role: 'admin',
    },
  });
  console.log('✅ ادمین ساخته شد:', admin);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());