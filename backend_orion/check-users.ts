import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('Checking users in database...');
    const users = await prisma.user.findMany({
        select: { email: true }
    });
    console.log('Users found:', users);
}

main();
