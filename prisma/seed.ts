import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { getDate } from '../src/utils/date.util';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.$transaction(async (tx) => {
    // Seed IncidentCategory
    const categoryPembegalan = await tx.incidentCategory.create({
      data: { name: 'Pembegalan', riskLevel: 'high' },
    });
    await tx.incidentCategory.createMany({
      data: [
        { name: 'Kecelakaan', riskLevel: 'high' },
        { name: 'Perampasan atau Paksaan', riskLevel: 'high' },
        { name: 'Kebakaran dan Ledakan', riskLevel: 'high' },
        { name: 'Bencana Alam dan Kondisi Darurat', riskLevel: 'high' },
        { name: 'Kekerasan Fisik dan Kriminalitas', riskLevel: 'high' },
        { name: 'Pencurian dan Perampokan', riskLevel: 'medium' },
        { name: 'Pelecehan dan Ancaman Pribadi', riskLevel: 'medium' },
        { name: 'Situasi Darurat Medis', riskLevel: 'medium' },
        { name: 'Kecelakaan dan Kejadian Lalu Lintas', riskLevel: 'medium' },
        { name: 'Gangguan Ketertiban Umum', riskLevel: 'low' },
        { name: 'Gangguan Keamanan Lingkungan', riskLevel: 'low' },
      ],
    });

    // Seed Users
    const andi = await tx.user.create({
      data: {
        email: 'andi.pratama@gmail.com',
        name: 'Andi Pratama',
        password: bcrypt.hashSync('Andi123!', 10),
        phone: '081234567890',
        profilePhoto: '1dX61J5_x4f-TUNay4wf5kiQwCQGJ0t90',
      },
    });

    const budi = await tx.user.create({
      data: {
        email: 'budi.santoso@example.com',
        name: 'Budi Santoso',
        password: bcrypt.hashSync('BudiS@123', 10),
        phone: '082134567891',
      },
    });

    const siti = await tx.user.create({
      data: {
        email: 'siti.nurhaliza@example.com',
        name: 'Siti Nurhaliza',
        password: bcrypt.hashSync('Siti@1234', 10),
        phone: '086178901235',
        profilePhoto: '1ay4HPdjOFzHhq2aJi_WMiXeYdk2woxsR',
      },
    });

    const ayu = await tx.user.create({
      data: {
        email: 'ayu.lestari@example.com',
        name: 'Ayu Lestari',
        password: bcrypt.hashSync('AyuLestari_21', 10),
        phone: '087189012346',
        profilePhoto: '169VSqQ5BDMkVo_7zHpNo5edhfqW2aB1w',
      },
    });

    // Seed Incidents
    const [incident] = await tx.$queryRawUnsafe<any[]>(
      `
    INSERT INTO "Incident" (
      "category_id", "status", "risk_level", 
      "date_start", "date_end", "time_start", "time_end", 
      "location", "radius"
    ) VALUES (
      $1, -- categoryId
      'active',
      'high',
      $2::date,
      $2::date,
      $3::time,
      $4::time,
      ST_SetSRID(ST_MakePoint($5, $6), 4326), -- longitude, latitude
      $7
    )
    RETURNING id;
  `,
      categoryPembegalan.id,
      '2025-02-19', // dateStart & dateEnd
      '19:00', // timeStart
      '20:00', // timeEnd
      107.52420030957933, // centroid longitude
      -6.884348919916044, // centroid latitude
      10, // radius
    );

    // Seed Reports
    const report1 = await tx.report.create({
      data: {
        userEmail: siti.email,
        description: 'Pembegalan motor di jalan ibu ganirah cimahi',
        latitude: -6.884275453943853,
        longitude: 107.52424339838008,
        date: getDate('2025-02-19'),
        time: getDate('19:30'),
        incidentId: incident.id,
      },
    });

    const report2 = await tx.report.create({
      data: {
        userEmail: budi.email,
        description: 'Aksi pembegalan motor terhadap mahasiswa',
        latitude: -6.884397052259107,
        longitude: 107.52415722077858,
        date: getDate('2025-02-19'),
        time: getDate('19:00'),
        incidentId: incident.id,
      },
    });

    const report3 = await tx.report.create({
      data: {
        userEmail: andi.email,
        description:
          'Pelaku begal merampas tas pengendara di jalan ibu ganirah',
        latitude: -6.884422385888235,
        longitude: 107.5241731692771,
        date: getDate('2025-02-19'),
        time: getDate('20:00'),
        incidentId: incident.id,
      },
    });

    // Seed Votes
    await tx.vote.createMany({
      data: [
        { type: 'upvote', reportId: report1.id, userEmail: siti.email },
        { type: 'upvote', reportId: report1.id, userEmail: budi.email },
        { type: 'upvote', reportId: report2.id, userEmail: andi.email },
        { type: 'upvote', reportId: report2.id, userEmail: siti.email },
        { type: 'upvote', reportId: report3.id, userEmail: andi.email },
        { type: 'upvote', reportId: report3.id, userEmail: budi.email },
      ],
    });

    // Seed Comments
    const now = new Date();

    await tx.comment.createMany({
      data: [
        {
          reportId: report1.id,
          userEmail: budi.email,
          comment:
            'Wah, serem banget! Gue sering lewat sini malem-malem, harus lebih hati-hati nih.',
          createdAt: now,
          updatedAt: new Date(now.getTime() + 5000),
        },
        {
          reportId: report1.id,
          userEmail: ayu.email,
          comment: 'Korbannya gapapa kan?',
        },
        {
          reportId: report1.id,
          userEmail: andi.email,
          comment: 'Anjir, deket kampus ini.',
        },
      ],
    });

    // Seed Attachments
    await tx.attachment.createMany({
      data: [
        {
          reportId: report1.id,
          uri: '1kH0xU1DQXqU10i8Js-plHsvgQaQKJzxa',
        },
        {
          reportId: report1.id,
          uri: '1KWlz-FsGqcDp9PuzsZIf_0fyC7ee_IRQ',
        },
        {
          reportId: report1.id,
          uri: '1-3-wosWj9NbGmr3A441W9AquoqU9UaE-',
        },
      ],
    });
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
