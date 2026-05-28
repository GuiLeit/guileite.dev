export const SKILLS = {
  languages:  ['TypeScript', 'Go', 'Python', 'Rust', 'SQL', 'Bash'],
  frameworks: ['Next.js', 'NestJS', 'React', 'Tailwind', 'Prisma', 'tRPC'],
  tools:      ['Git', 'Docker', 'Turborepo', 'Vercel', 'Fly.io', 'Figma'],
  databases:  ['PostgreSQL', 'Redis', 'SQLite', 'Neon'],
} as const;

export type SkillGroup = keyof typeof SKILLS;
