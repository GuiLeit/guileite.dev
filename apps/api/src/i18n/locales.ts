export const DEFAULT_LOCALE = process.env.DEFAULT_LOCALE ?? 'pt-BR';
export const SUPPORTED_LOCALES = (
  process.env.SUPPORTED_LOCALES ?? 'pt-BR,en'
).split(',');
