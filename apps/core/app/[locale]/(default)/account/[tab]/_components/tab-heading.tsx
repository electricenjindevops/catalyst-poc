import { getTranslations } from 'next-intl/server';

import { TabType } from '../layout';

export const TabHeading = async ({ heading, locale }: { heading: TabType; locale: string }) => {
  const t = await getTranslations({ locale, namespace: 'Account.Home' });

  return <h2 className="mb-8 text-3xl font-black lg:text-4xl">{t(heading)}</h2>;
};
