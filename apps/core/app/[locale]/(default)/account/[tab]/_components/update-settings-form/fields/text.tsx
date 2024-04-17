import { Field, FieldControl, FieldLabel, FieldMessage } from '@bigcommerce/components/form';
import { Input } from '@bigcommerce/components/input';
import { useTranslations } from 'next-intl';
import { ChangeEvent } from 'react';

interface TextProps {
  defaultValue?: string;
  isRequired?: boolean;
  isValid?: boolean;
  label: string;
  name: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email';
}

export const Text = ({
  defaultValue,
  isRequired = false,
  isValid,
  label,
  name,
  onChange,
  type = 'text',
}: TextProps) => {
  const t = useTranslations('Account.Settings');

  return (
    <Field className="relative space-y-2 pb-7" name={name}>
      <FieldLabel htmlFor={name} isRequired={isRequired}>
        {label}
      </FieldLabel>
      <FieldControl asChild>
        <Input
          defaultValue={defaultValue}
          id={name}
          onChange={isRequired ? onChange : undefined}
          onInvalid={isRequired ? onChange : undefined}
          required={isRequired}
          type={type}
          variant={isValid === false ? 'error' : undefined}
        />
      </FieldControl>
      {isRequired && (
        <FieldMessage
          className="absolute inset-x-0 bottom-0 inline-flex w-full text-xs font-normal text-red-200"
          match="valueMissing"
        >
          {t('emptyTextValidatoinMessage')}
        </FieldMessage>
      )}
    </Field>
  );
};
