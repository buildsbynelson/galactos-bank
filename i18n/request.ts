import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const locales = ['en', 'es', 'fr', 'hi', 'ar', 'zh', 'pt'];

export default getRequestConfig(async () => {
  // Read locale from cookie
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = localeCookie?.value || 'en'; // Default to 'en' if no cookie
  
  // Validate locale
  const finalLocale = locales.includes(locale) ? locale : 'en';

  return {
    locale: finalLocale,
    messages: (await import(`../messages/${finalLocale}.json`)).default
  };
});