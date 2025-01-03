import { prisma } from '../lib/prisma.ts';

async function main() {
  await prisma.course.createMany({
    data: [
      { name: 'trading', fullPrice: 70, discountPrice: 56 },
      { name: 'web3', fullPrice: 250, discountPrice: 175 },
    ],
    skipDuplicates: true, // Prevents inserting duplicates
  });

  console.log('Courses seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
