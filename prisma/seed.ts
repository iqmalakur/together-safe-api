import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { getDate } from '../src/utils/date.util';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed IncidentCategory
  const categoryPembegalan = await prisma.incidentCategory.create({
    data: { name: 'Pembegalan' },
  });
  await prisma.incidentCategory.create({
    data: { name: 'Kecelakaan' },
  });

  // Seed Users
  const ucup = await prisma.user.create({
    data: {
      email: 'ucup@gmail.com',
      name: 'Ucup',
      password: bcrypt.hashSync('ucup123', 10),
      phone: '081234567891',
    },
  });

  const budi = await prisma.user.create({
    data: {
      email: 'budi@gmail.com',
      name: 'Budi',
      password: bcrypt.hashSync('budi123', 10),
      phone: '081234567893',
    },
  });

  const wati = await prisma.user.create({
    data: {
      email: 'wati@gmail.com',
      name: 'Wati',
      password: bcrypt.hashSync('wati123', 10),
      phone: '081234567894',
    },
  });

  // Seed Reports
  const report1 = await prisma.report.create({
    data: {
      userEmail: ucup.email,
      description: 'Pembegalan motor di jalan ibu ganirah cimahi',
      latitude: -6.884275453943853,
      longitude: 107.52424339838008,
      date: getDate('2025-02-19'),
      time: getDate('19:30'),
      categoryId: categoryPembegalan.id,
    },
  });

  const report2 = await prisma.report.create({
    data: {
      userEmail: budi.email,
      description: 'Aksi pembegalan motor terhadap mahasiswa',
      latitude: -6.884397052259107,
      longitude: 107.52415722077858,
      date: getDate('2025-02-19'),
      time: getDate('19:00'),
      categoryId: categoryPembegalan.id,
    },
  });

  const report3 = await prisma.report.create({
    data: {
      userEmail: wati.email,
      description: 'Pelaku begal merampas tas pengendara di jalan ibu ganirah',
      latitude: -6.884422385888235,
      longitude: 107.5241731692771,
      date: getDate('2025-02-19'),
      time: getDate('20:00'),
      categoryId: categoryPembegalan.id,
    },
  });

  // Seed Incidents
  await prisma.incident.create({
    data: {
      categoryId: categoryPembegalan.id,
      status: 'active',
      riskLevel: 'high',
      dateStart: getDate('2025-02-19'),
      dateEnd: getDate('2025-02-19'),
      timeStart: getDate('19:00'),
      timeEnd: getDate('20:00'),
      latitude_min: -6.884422385888235,
      latitude_max: -6.884275453943853,
      latitude_centroid: -6.884348919916044,
      longitude_min: 107.52415722077858,
      longitude_max: 107.52424339838008,
      longitude_centroid: 107.52420030957933,
    },
  });

  // Seed Votes
  await prisma.vote.createMany({
    data: [
      { type: 'upvote', reportId: report1.id, userEmail: wati.email },
      { type: 'upvote', reportId: report1.id, userEmail: budi.email },
      { type: 'upvote', reportId: report2.id, userEmail: ucup.email },
      { type: 'upvote', reportId: report2.id, userEmail: wati.email },
      { type: 'upvote', reportId: report3.id, userEmail: ucup.email },
      { type: 'upvote', reportId: report3.id, userEmail: budi.email },
    ],
  });

  // Seed Comments
  await prisma.comment.createMany({
    data: [
      {
        reportId: report1.id,
        userEmail: wati.email,
        comment:
          'Wah, serem banget! Gue sering lewat sini malem-malem, harus lebih hati-hati nih.',
      },
      {
        reportId: report1.id,
        userEmail: budi.email,
        comment: 'Korbannya gapapa kan?',
      },
      {
        reportId: report2.id,
        userEmail: ucup.email,
        comment: 'Anjir, deket kampus ini.',
      },
    ],
  });

  // Seed Attachments
  await prisma.attachment.createMany({
    data: [
      {
        reportId: report1.id,
        uri: 'https://static.promediateknologi.id/crop/266x0:666x144/750x500/webp/photo/p1/338/2024/08/20/VideoCapture_20240819-202046-1782971598.jpg',
      },
      {
        reportId: report1.id,
        uri: 'https://assets.promediateknologi.id/crop/0x0:0x0/750x500/webp/photo/2023/06/24/image_2023-06-24_095907624-957526239.png',
      },
      {
        reportId: report1.id,
        uri: 'https://kabar6.com/wp-content/uploads/IMG-20240627-WA00001.jpg',
      },
    ],
  });

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });
