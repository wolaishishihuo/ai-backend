import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5
});

const prisma = new PrismaClient({ adapter });

// 数据库初始化
const initUsers = [
  {
    username: 'admin',
    password: 'admin',
    email: 'admin@example.com'
  }
];

async function main() {
  const users = await prisma.user.createMany({
    data: initUsers
  });
  console.log('createUsers result:', users);
}

main()
  .catch((e) => {
    console.error('Error info:', e.message);
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
