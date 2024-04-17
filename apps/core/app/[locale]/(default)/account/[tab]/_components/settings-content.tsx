import { getLocale } from 'next-intl/server';

import { getCustomerSettingsQuery } from '../page-data';

import { TabHeading } from './tab-heading';
import { UpdateSettingsForm } from './update-settings-form';

type CustomerSettings = NonNullable<Awaited<ReturnType<typeof getCustomerSettingsQuery>>>;

interface Props {
  customerSettings: CustomerSettings;
}

export const SettingsContent = async ({ customerSettings }: Props) => {
  const locale = await getLocale();

  return (
    <div className="mx-auto lg:w-2/3">
      <TabHeading heading="settings" locale={locale} />
      <UpdateSettingsForm
        addressFields={customerSettings.addressFields}
        customerFields={customerSettings.customerFields}
        customerInfo={customerSettings.customerInfo}
      />
    </div>
  );
};
