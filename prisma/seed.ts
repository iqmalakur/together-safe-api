import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { getDate, getDateString, getTimeString } from '../src/utils/date.util';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const current = new Date();

  const yesterday = new Date(current);
  yesterday.setDate(current.getDate() - 1);

  const tomorrow = new Date(current);
  tomorrow.setDate(current.getDate() + 1);

  const dateStrings = {
    yesterday: getDateString(yesterday),
    today: getDateString(current),
    tomorrow: getDateString(tomorrow),
  };

  const oneHourBefore = new Date(current);
  oneHourBefore.setHours(current.getHours() - 1);

  const oneHourAfter = new Date(current);
  oneHourAfter.setHours(current.getHours() + 1);

  const timeStrings = {
    oneHourBefore: getTimeString(oneHourBefore),
    now: getTimeString(current),
    oneHourAfter: getTimeString(oneHourAfter),
  };

  await prisma.$transaction(async (tx) => {
    // Seed IncidentCategory
    const categoryKriminalitas = (
      await tx.$queryRaw<{ id: string }>`
        INSERT INTO "IncidentCategory" ("name", "min_risk_level", "max_risk_level", "ttl_date", "ttl_time")
        VALUES (
          'Kriminalitas', 'medium', 'high',
          INTERVAL '7 days', INTERVAL '3 hours'
        )
        RETURNING id;
      `
    )[0];

    await tx.$executeRaw`
      INSERT INTO "IncidentCategory" ("name", "min_risk_level", "max_risk_level", "ttl_date", "ttl_time")
      VALUES
        ('Kecelakaan Lalu Lintas', 'medium', 'high', INTERVAL '0 hours', INTERVAL '3 hours'),
        ('Kebakaran', 'medium', 'high', INTERVAL '0 hours', INTERVAL '5 hours'),
        ('Kemacetan Lalu Lintas', 'low', 'medium', INTERVAL '0 hours', INTERVAL '3 hours');
    `;

    // Seed Users
    const andi = await tx.user.create({
      data: {
        email: 'andi.pratama@gmail.com',
        name: 'Andi Pratama',
        password: bcrypt.hashSync('Andi123!', 10),
        profilePhoto: '1JhJvGdGhKV3ZQPu_4cYTYgmFPNet3hKj',
      },
    });

    const budi = await tx.user.create({
      data: {
        email: 'budi.santoso@example.com',
        name: 'Budi Santoso',
        password: bcrypt.hashSync('BudiS@123', 10),
        profilePhoto: '17ZowAHAXQQCgZSfQV_LaPGwyh6db9dQ9',
      },
    });

    const siti = await tx.user.create({
      data: {
        email: 'siti.nurhaliza@example.com',
        name: 'Siti Nurhaliza',
        password: bcrypt.hashSync('Siti@1234', 10),
        profilePhoto: '1WyGdqaDUKXGSY_KhxSSrppcT2xJe_z73',
      },
    });

    const ayu = await tx.user.create({
      data: {
        email: 'ayu.lestari@example.com',
        name: 'Ayu Lestari',
        password: bcrypt.hashSync('AyuLestari_21', 10),
        profilePhoto: '12eyzh9ZFidABMn1Gpyr-S-Dr9i71VU6D',
      },
    });

    // Seed Incidents
    const [incident] = await tx.$queryRawUnsafe<any[]>(
      `
    INSERT INTO "Incident" (
      "category_id", "risk_level", 
      "date_start", "date_end", "time_start", "time_end", 
      "location", "radius"
    ) VALUES (
      $1, -- categoryId
      'high',
      $2::date,
      $3::date,
      $4::time,
      $5::time,
      ST_SetSRID(ST_MakePoint($6, $7), 4326), -- longitude, latitude
      $8
    )
    RETURNING id;
  `,
      categoryKriminalitas.id,
      dateStrings.yesterday, // dateStart
      dateStrings.tomorrow, // dateEnd
      timeStrings.oneHourBefore, // timeStart
      timeStrings.oneHourAfter, // timeEnd
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
        date: getDate(dateStrings.yesterday),
        time: getDate(timeStrings.oneHourBefore),
        incidentId: incident.id,
      },
    });

    const report2 = await tx.report.create({
      data: {
        userEmail: budi.email,
        description: 'Aksi pembegalan motor terhadap mahasiswa',
        latitude: -6.884397052259107,
        longitude: 107.52415722077858,
        date: getDate(dateStrings.today),
        time: getDate(timeStrings.now),
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
        date: getDate(dateStrings.yesterday),
        time: getDate(timeStrings.oneHourAfter),
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
