const locale = 'es-ES';

export const formatDateShort = (date: string | Date) =>
  new Date(date).toLocaleDateString(locale, { day: 'numeric', month: 'short' });

export const formatDateLong = (date: string | Date) =>
  new Date(date).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export const formatDateDefault = (date: string | Date) =>
  new Date(date).toLocaleDateString(locale);

export const formatTime = (date: string | Date) =>
  new Date(date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

export const toISODate = (date: string | Date) =>
  new Date(date).toISOString().split('T')[0];
