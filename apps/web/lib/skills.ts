export const SKILLS = {
  languages:  ['Java', 'TypeScript', 'PHP', 'SQL'],
  frameworks: ['Spring Boot', 'NestJS', 'Laravel', 'React Native', 'ReactJS'],
  tools:      ['Docker', 'AWS', 'Maven', 'Swagger / OpenAPI', 'Git'],
  databases:  ['PostgreSQL', 'MySQL', 'Cassandra', 'JPA / Hibernate'],
} as const;

export type SkillGroup = keyof typeof SKILLS;
