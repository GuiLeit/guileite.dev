import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (safe for dev)
  await prisma.project.deleteMany();

  await prisma.project.create({
    data: {
      projectUrl: 'https://shotbox.dev',
      githubUrl: 'https://github.com/guileite/shotbox',
      orderIndex: 0,
      translations: {
        create: [
          {
            locale: 'pt-BR',
            title: 'Shotbox',
            description: 'Servidor de arquivos estáticos com presets para times pequenos.',
          },
          {
            locale: 'en',
            title: 'Shotbox',
            description: 'A static file server with presets for small teams.',
          },
        ],
      },
      images: {
        create: [
          { url: 'https://placehold.co/800x500/1a1a1a/666?text=SHB', alt: 'Shotbox screenshot', order: 0 },
        ],
      },
    },
  });

  await prisma.project.create({
    data: {
      githubUrl: 'https://github.com/guileite/lume',
      orderIndex: 1,
      translations: {
        create: [
          {
            locale: 'pt-BR',
            title: 'Lume',
            description: 'Biblioteca de componentes para interfaces administrativas densas.',
          },
          {
            locale: 'en',
            title: 'Lume',
            description: 'A component library for dense admin interfaces.',
          },
        ],
      },
      images: {
        create: [
          { url: 'https://placehold.co/800x500/1a1a1a/666?text=LUM', alt: 'Lume screenshot', order: 0 },
        ],
      },
    },
  });

  await prisma.project.create({
    data: {
      projectUrl: 'https://orbital.run',
      githubUrl: 'https://github.com/guileite/orbital',
      orderIndex: 2,
      translations: {
        create: [
          {
            locale: 'pt-BR',
            title: 'Orbital',
            description: 'Agendador de jobs distribuído com leasing por lock no Postgres.',
          },
          {
            locale: 'en',
            title: 'Orbital',
            description: 'A distributed cron runner that leases jobs via Postgres advisory locks.',
          },
        ],
      },
      images: {
        create: [
          { url: 'https://placehold.co/800x500/1a1a1a/666?text=ORB', alt: 'Orbital screenshot', order: 0 },
        ],
      },
    },
  });

  console.log('Seeded 3 projects (pt-BR + en translations each)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
