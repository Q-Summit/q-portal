"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Popular European countries for a German student organization
const COUNTRY_CODES = [
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "+43", country: "AT", flag: "🇦🇹", name: "Austria" },
  { code: "+41", country: "CH", flag: "🇨🇭", name: "Switzerland" },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
  { code: "+31", country: "NL", flag: "🇳🇱", name: "Netherlands" },
  { code: "+32", country: "BE", flag: "🇧🇪", name: "Belgium" },
  { code: "+39", country: "IT", flag: "🇮🇹", name: "Italy" },
  { code: "+34", country: "ES", flag: "🇪🇸", name: "Spain" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+48", country: "PL", flag: "🇵🇱", name: "Poland" },
  { code: "+420", country: "CZ", flag: "🇨🇿", name: "Czech Republic" },
  { code: "+1", country: "US", flag: "🇺🇸", name: "USA" },
] as const;

export type CountryCode = (typeof COUNTRY_CODES)[number]["code"];

interface PhoneInputProps {
  countryCode: CountryCode;
  phoneNumber: string;
  onCountryCodeChange: (code: CountryCode) => void;
  onPhoneNumberChange: (number: string) => void;
  error?: string;
  className?: string;
}

export function PhoneInput({
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  error,
  className,
}: PhoneInputProps) {
  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) ?? COUNTRY_CODES[0];

  // Format phone number - strip non-digit characters except for display
  const handlePhoneChange = (value: string) => {
    // Allow digits, spaces, and dashes for formatting
    const formatted = value.replace(/[^\d\s-]/g, "");
    onPhoneNumberChange(formatted);
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex gap-2">
        <Select value={countryCode} onValueChange={(v) => onCountryCodeChange(v as CountryCode)}>
          <SelectTrigger className="h-10 w-[100px] shrink-0 rounded-lg border-border bg-white">
            <SelectValue>
              <span className="flex items-center gap-1.5">
                <span className="text-base">{selectedCountry.flag}</span>
                <span className="text-sm font-medium">{selectedCountry.code}</span>
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-white">
            {COUNTRY_CODES.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <span className="flex items-center gap-2">
                  <span className="text-base">{country.flag}</span>
                  <span className="text-sm">{country.code}</span>
                  <span className="text-xs text-muted-foreground">{country.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          type="tel"
          inputMode="tel"
          value={phoneNumber}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="170 1234567"
          className={cn(
            "h-10 flex-1 rounded-lg border bg-white px-3 text-sm font-medium outline-none transition-colors",
            "placeholder:text-muted-foreground",
            "focus:ring-2 focus:ring-ring focus:ring-offset-1",
            error ? "border-destructive" : "border-border",
          )}
        />
      </div>
      {error && <span className="text-xs font-medium text-destructive">{error}</span>}
    </div>
  );
}

/**
 * Parse a full phone string (e.g., "+49 170 1234567") into parts.
 */
export function parsePhoneNumber(full: string): { countryCode: CountryCode; number: string } {
  if (!full) return { countryCode: "+49", number: "" };

  // Try to match a country code at the start
  for (const country of COUNTRY_CODES) {
    if (full.startsWith(country.code)) {
      return {
        countryCode: country.code,
        number: full.slice(country.code.length).trim(),
      };
    }
  }

  // Default to Germany if no match - preserve full input
  return { countryCode: "+49", number: full.trim() };
}

/**
 * Combine country code and number into a full phone string.
 */
export function formatFullPhoneNumber(countryCode: CountryCode, number: string): string {
  if (!number.trim()) return "";
  return `${countryCode} ${number.trim()}`;
}
