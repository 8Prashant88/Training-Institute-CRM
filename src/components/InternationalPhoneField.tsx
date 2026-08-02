"use client";

import PhoneInput, {
  getCountries,
  getCountryCallingCode,
  type Value,
} from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import englishLabels from "react-phone-number-input/locale/en";

type InternationalPhoneFieldProps = {
  id: string;
  name: string;
  value: Value | undefined;
  onChange: (value: Value | undefined) => void;
  invalid?: boolean;
  disabled?: boolean;
  "aria-describedby"?: string;
};

const labels = englishLabels as Record<string, string>;

const countryLabelsWithCallingCodes: Record<string, string> = {
  ...labels,
  ...Object.fromEntries(
    getCountries().map((country) => [
      country,
      `${labels[country] ?? country} (+${getCountryCallingCode(
        country,
      )})`,
    ]),
  ),
};

export default function InternationalPhoneField({
  id,
  name,
  value,
  onChange,
  invalid = false,
  disabled = false,
  "aria-describedby": ariaDescribedBy,
}: InternationalPhoneFieldProps) {
  return (
    <PhoneInput
      id={id}
      name={name}
      defaultCountry="NP"
      international
      countryCallingCodeEditable={false}
      flags={flags}
      labels={countryLabelsWithCallingCodes}
      value={value}
      onChange={onChange}
      disabled={disabled}
      autoComplete="tel"
      placeholder="Enter phone number"
      aria-invalid={invalid}
      aria-describedby={ariaDescribedBy}
      className={`international-phone-input ${
        invalid ? "international-phone-input--error" : ""
      }`}
    />
  );
}
