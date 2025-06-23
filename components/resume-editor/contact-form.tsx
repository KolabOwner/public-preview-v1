'use client';

import React, { useEffect, useState, ChangeEvent } from 'react';
import { useForm, UseFormRegister, FieldErrors } from 'react-hook-form';
import { Save, Loader2, AlertCircle, Link2, Mail, Phone, Linkedin, Globe, MapPin, LucideIcon } from "lucide-react";

// Extended interface with location fields
export interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  website: string;
  country: string;
  state: string;
  city: string;
  showEmail: boolean;
  showPhone: boolean;
  showLinkedin: boolean;
  showWebsite: boolean;
  showLocation: boolean;
}

interface ContactFormProps {
  initialData: ContactFormData;
  onSave: (data: ContactFormData) => Promise<void>;
  autoSave?: boolean;
}

interface SelectOption {
  value: string;
  label: string;
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: SelectOption[];
  disabled?: boolean;
}

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
}

interface FormFieldProps {
  id: keyof ContactFormData;
  label: string;
  placeholder: string;
  type?: string;
  prefix?: string;
  icon?: LucideIcon | null;
  showToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (checked: boolean) => void;
  register: UseFormRegister<ContactFormData>;
  errors: FieldErrors<ContactFormData>;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

// Comprehensive country list
const COUNTRIES: SelectOption[] = [
  { value: 'US', label: 'United States' },
  { value: 'AF', label: 'Afghanistan' },
  { value: 'AL', label: 'Albania' },
  { value: 'DZ', label: 'Algeria' },
  { value: 'AD', label: 'Andorra' },
  { value: 'AO', label: 'Angola' },
  { value: 'AR', label: 'Argentina' },
  { value: 'AM', label: 'Armenia' },
  { value: 'AU', label: 'Australia' },
  { value: 'AT', label: 'Austria' },
  { value: 'AZ', label: 'Azerbaijan' },
  { value: 'BS', label: 'Bahamas' },
  { value: 'BH', label: 'Bahrain' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'BB', label: 'Barbados' },
  { value: 'BY', label: 'Belarus' },
  { value: 'BE', label: 'Belgium' },
  { value: 'BZ', label: 'Belize' },
  { value: 'BJ', label: 'Benin' },
  { value: 'BT', label: 'Bhutan' },
  { value: 'BO', label: 'Bolivia' },
  { value: 'BR', label: 'Brazil' },
  { value: 'BG', label: 'Bulgaria' },
  { value: 'CA', label: 'Canada' },
  { value: 'CL', label: 'Chile' },
  { value: 'CN', label: 'China' },
  { value: 'CO', label: 'Colombia' },
  { value: 'CR', label: 'Costa Rica' },
  { value: 'HR', label: 'Croatia' },
  { value: 'CU', label: 'Cuba' },
  { value: 'CY', label: 'Cyprus' },
  { value: 'CZ', label: 'Czech Republic' },
  { value: 'DK', label: 'Denmark' },
  { value: 'EC', label: 'Ecuador' },
  { value: 'EG', label: 'Egypt' },
  { value: 'EE', label: 'Estonia' },
  { value: 'FI', label: 'Finland' },
  { value: 'FR', label: 'France' },
  { value: 'DE', label: 'Germany' },
  { value: 'GR', label: 'Greece' },
  { value: 'HK', label: 'Hong Kong' },
  { value: 'HU', label: 'Hungary' },
  { value: 'IS', label: 'Iceland' },
  { value: 'IN', label: 'India' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'IR', label: 'Iran' },
  { value: 'IQ', label: 'Iraq' },
  { value: 'IE', label: 'Ireland' },
  { value: 'IL', label: 'Israel' },
  { value: 'IT', label: 'Italy' },
  { value: 'JP', label: 'Japan' },
  { value: 'JO', label: 'Jordan' },
  { value: 'KZ', label: 'Kazakhstan' },
  { value: 'KE', label: 'Kenya' },
  { value: 'KR', label: 'South Korea' },
  { value: 'KW', label: 'Kuwait' },
  { value: 'LV', label: 'Latvia' },
  { value: 'LB', label: 'Lebanon' },
  { value: 'LT', label: 'Lithuania' },
  { value: 'LU', label: 'Luxembourg' },
  { value: 'MY', label: 'Malaysia' },
  { value: 'MX', label: 'Mexico' },
  { value: 'MA', label: 'Morocco' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'NO', label: 'Norway' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'PE', label: 'Peru' },
  { value: 'PH', label: 'Philippines' },
  { value: 'PL', label: 'Poland' },
  { value: 'PT', label: 'Portugal' },
  { value: 'QA', label: 'Qatar' },
  { value: 'RO', label: 'Romania' },
  { value: 'RU', label: 'Russia' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'RS', label: 'Serbia' },
  { value: 'SG', label: 'Singapore' },
  { value: 'SK', label: 'Slovakia' },
  { value: 'SI', label: 'Slovenia' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'ES', label: 'Spain' },
  { value: 'SE', label: 'Sweden' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'TW', label: 'Taiwan' },
  { value: 'TH', label: 'Thailand' },
  { value: 'TR', label: 'Turkey' },
  { value: 'UA', label: 'Ukraine' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'UY', label: 'Uruguay' },
  { value: 'VE', label: 'Venezuela' },
  { value: 'VN', label: 'Vietnam' },
];

// Complete US States list
const US_STATES: SelectOption[] = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'District of Columbia' },
];

// Canadian provinces
const CANADA_PROVINCES: SelectOption[] = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'YT', label: 'Yukon' },
];

// Country name to code mapping
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  'United States': 'US',
  'United States of America': 'US',
  'USA': 'US',
  'US': 'US',
  'Canada': 'CA',
  'CA': 'CA',
  'United Kingdom': 'UK',
  'UK': 'UK',
  'Germany': 'DE',
  'France': 'FR',
  'Australia': 'AU',
  'Japan': 'JP',
  'China': 'CN',
  'India': 'IN',
  'Brazil': 'BR',
  'Mexico': 'MX',
  'Spain': 'ES',
  'Italy': 'IT',
  'Netherlands': 'NL',
  'Sweden': 'SE',
  'Norway': 'NO',
  'Denmark': 'DK',
  'Finland': 'FI',
  'Switzerland': 'CH',
  'Austria': 'AT',
  'Belgium': 'BE',
  'Ireland': 'IE',
  'New Zealand': 'NZ',
  'South Korea': 'KR',
  'Singapore': 'SG',
  'Hong Kong': 'HK',
  'Taiwan': 'TW',
  'Israel': 'IL',
  'United Arab Emirates': 'AE',
  'Saudi Arabia': 'SA',
  'South Africa': 'ZA',
  'Argentina': 'AR',
  'Chile': 'CL',
  'Colombia': 'CO',
  'Peru': 'PE',
  'Venezuela': 'VE',
  'Thailand': 'TH',
  'Malaysia': 'MY',
  'Indonesia': 'ID',
  'Philippines': 'PH',
  'Vietnam': 'VN',
  'Turkey': 'TR',
  'Russia': 'RU',
  'Poland': 'PL',
  'Czech Republic': 'CZ',
  'Hungary': 'HU',
  'Romania': 'RO',
  'Bulgaria': 'BG',
  'Croatia': 'HR',
  'Slovenia': 'SI',
  'Slovakia': 'SK',
  'Estonia': 'EE',
  'Latvia': 'LV',
  'Lithuania': 'LT',
  'Portugal': 'PT',
  'Greece': 'GR',
  'Cyprus': 'CY',
  'Malta': 'MT',
  'Luxembourg': 'LU',
  'Iceland': 'IS',
  'Egypt': 'EG',
  'Morocco': 'MA',
  'Algeria': 'DZ',
  'Nigeria': 'NG',
  'Kenya': 'KE',
  'Ghana': 'GH',
  'Ethiopia': 'ET',
  'Uganda': 'UG',
  'Tanzania': 'TZ',
  'Zimbabwe': 'ZW',
  'Botswana': 'BW',
  'Namibia': 'NA',
  'Zambia': 'ZM',
  'Malawi': 'MW',
  'Rwanda': 'RW',
  'Burundi': 'BI',
  'Madagascar': 'MG',
  'Mauritius': 'MU',
  'Seychelles': 'SC',
  'Pakistan': 'PK',
  'Bangladesh': 'BD',
  'Sri Lanka': 'LK',
  'Nepal': 'NP',
  'Bhutan': 'BT',
  'Afghanistan': 'AF',
  'Iran': 'IR',
  'Iraq': 'IQ',
  'Syria': 'SY',
  'Lebanon': 'LB',
  'Jordan': 'JO',
  'Palestine': 'PS',
  'Kuwait': 'KW',
  'Qatar': 'QA',
  'Bahrain': 'BH',
  'Oman': 'OM',
  'Yemen': 'YE',
  'Georgia': 'GE',
  'Armenia': 'AM',
  'Azerbaijan': 'AZ',
  'Kazakhstan': 'KZ',
  'Kyrgyzstan': 'KG',
  'Tajikistan': 'TJ',
  'Turkmenistan': 'TM',
  'Uzbekistan': 'UZ',
  'Mongolia': 'MN',
  'North Korea': 'KP',
  'Myanmar': 'MM',
  'Laos': 'LA',
  'Cambodia': 'KH',
  'Brunei': 'BN',
  'East Timor': 'TL',
  'Papua New Guinea': 'PG',
  'Fiji': 'FJ',
  'Samoa': 'WS',
  'Tonga': 'TO',
  'Vanuatu': 'VU',
  'Solomon Islands': 'SB',
  'Palau': 'PW',
  'Micronesia': 'FM',
  'Marshall Islands': 'MH',
  'Kiribati': 'KI',
  'Tuvalu': 'TV',
  'Nauru': 'NR'
};

// Common placeholder values that should be treated as empty
const EMPTY_VALUE_PLACEHOLDERS: string[] = [
  'n/a',
  'N/A',
  'na',
  'NA',
  'none',
  'None',
  'NONE',
  'null',
  'NULL',
  'undefined',
  'UNDEFINED',
  '-',
  '--',
  '---',
  'not applicable',
  'Not Applicable',
  'NOT APPLICABLE',
  'not available',
  'Not Available',
  'NOT AVAILABLE',
  'empty',
  'Empty',
  'EMPTY',
  'blank',
  'Blank',
  'BLANK',
  'tbd',
  'TBD',
  'to be determined',
  'To Be Determined',
  'TO BE DETERMINED'
];

// Function to clean placeholder values
const cleanPlaceholderValue = (value: string | undefined | null): string => {
  if (!value || typeof value !== 'string') return '';

  const trimmedValue = value.trim();

  // Check if the value is a common placeholder
  if (EMPTY_VALUE_PLACEHOLDERS.includes(trimmedValue)) {
    return '';
  }

  return trimmedValue;
};

const phoneRegExp = /^(\+\d{1,3}\s?)?(\(\d{3}\)\s?)?\d{3}[-\s]?\d{4}$/;

// City to state mapping for major US cities
const CITY_TO_STATE: Record<string, string> = {
  'New York City': 'NY',
  'New York': 'NY',
  'NYC': 'NY',
  'Los Angeles': 'CA',
  'Chicago': 'IL',
  'Houston': 'TX',
  'Phoenix': 'AZ',
  'Philadelphia': 'PA',
  'San Antonio': 'TX',
  'San Diego': 'CA',
  'Dallas': 'TX',
  'San Jose': 'CA',
  'Austin': 'TX',
  'Jacksonville': 'FL',
  'Fort Worth': 'TX',
  'Columbus': 'OH',
  'Charlotte': 'NC',
  'San Francisco': 'CA',
  'Indianapolis': 'IN',
  'Seattle': 'WA',
  'Denver': 'CO',
  'Washington': 'DC',
  'Washington D.C.': 'DC',
  'Washington DC': 'DC',
  'Boston': 'MA',
  'El Paso': 'TX',
  'Nashville': 'TN',
  'Detroit': 'MI',
  'Oklahoma City': 'OK',
  'Portland': 'OR',
  'Las Vegas': 'NV',
  'Memphis': 'TN',
  'Louisville': 'KY',
  'Baltimore': 'MD',
  'Milwaukee': 'WI',
  'Albuquerque': 'NM',
  'Tucson': 'AZ',
  'Fresno': 'CA',
  'Sacramento': 'CA',
  'Mesa': 'AZ',
  'Kansas City': 'MO',
  'Atlanta': 'GA',
  'Long Beach': 'CA',
  'Colorado Springs': 'CO',
  'Raleigh': 'NC',
  'Miami': 'FL',
  'Virginia Beach': 'VA',
  'Omaha': 'NE',
  'Oakland': 'CA',
  'Minneapolis': 'MN',
  'Tulsa': 'OK',
  'Arlington': 'TX',
  'Tampa': 'FL',
  'New Orleans': 'LA',
  'Wichita': 'KS',
  'Cleveland': 'OH',
  'Bakersfield': 'CA',
  'Aurora': 'CO',
  'Anaheim': 'CA',
  'Honolulu': 'HI',
  'Santa Ana': 'CA',
  'Riverside': 'CA',
  'Corpus Christi': 'TX',
  'Lexington': 'KY',
  'Stockton': 'CA',
  'Henderson': 'NV',
  'Saint Paul': 'MN',
  'St. Paul': 'MN',
  'Cincinnati': 'OH',
  'Pittsburgh': 'PA',
  'Greensboro': 'NC',
  'Anchorage': 'AK',
  'Plano': 'TX',
  'Lincoln': 'NE',
  'Orlando': 'FL',
  'Irvine': 'CA',
  'Newark': 'NJ',
  'Durham': 'NC',
  'Chula Vista': 'CA',
  'Toledo': 'OH',
  'Fort Wayne': 'IN',
  'St. Petersburg': 'FL',
  'Laredo': 'TX',
  'Jersey City': 'NJ',
  'Chandler': 'AZ',
  'Madison': 'WI',
  'Lubbock': 'TX',
  'Scottsdale': 'AZ',
  'Reno': 'NV',
  'Buffalo': 'NY',
  'Gilbert': 'AZ',
  'Glendale': 'AZ',
  'North Las Vegas': 'NV',
  'Winston-Salem': 'NC',
  'Chesapeake': 'VA',
  'Norfolk': 'VA',
  'Fremont': 'CA',
  'Garland': 'TX',
  'Irving': 'TX',
  'Hialeah': 'FL',
  'Richmond': 'VA',
  'Boise': 'ID',
  'Spokane': 'WA',
  'Baton Rouge': 'LA'
};

// Validation rules - create a partial type that only includes fields that need validation
type ValidationFields = 'fullName' | 'email' | 'phone' | 'linkedin' | 'website' | 'city';
type ValidationRules = Record<ValidationFields, any>;

const validationRules: ValidationRules = {
  fullName: {
    required: 'Full name is required',
    minLength: {
      value: 2,
      message: 'Name must be at least 2 characters'
    }
  },
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email format'
    }
  },
  phone: {
    validate: (value: string) => {
      const cleanValue = cleanPlaceholderValue(value);
      if (!cleanValue) return true; // Allow empty
      return phoneRegExp.test(cleanValue) || 'Phone number is not valid';
    }
  },
  linkedin: {
    validate: (value: string) => {
      const cleanValue = cleanPlaceholderValue(value);
      if (!cleanValue) return true; // Allow empty
      const fullUrlPattern = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_]{3,100}\/?$/;
      const usernamePattern = /^[a-zA-Z0-9-_]{3,100}$/;
      return fullUrlPattern.test(cleanValue) || usernamePattern.test(cleanValue) || 'Invalid LinkedIn profile';
    }
  },
  website: {
    validate: (value: string) => {
      const cleanValue = cleanPlaceholderValue(value);
      if (!cleanValue) return true; // Allow empty
      const urlPattern = /^https?:\/\/.+\..+/;
      return urlPattern.test(cleanValue) || 'Invalid website URL';
    }
  },
  city: {
    validate: (value: string, formValues: ContactFormData) => {
      if (formValues.showLocation && !cleanPlaceholderValue(value)) {
        return 'City is required when showing location';
      }
      return true;
    }
  }
};

function formatPhoneNumber(value: string): string {
  const cleaned: string = value.replace(/\D/g, '');

  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else if (cleaned.length <= 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else {
    return `+${cleaned.slice(0, cleaned.length - 10)} (${cleaned.slice(-10, -7)}) ${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
  }
}

// Custom Toggle Switch Component
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, id }) => {
  return (
    <div className="relative">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
        className="sr-only"
      />
      <label
        htmlFor={id}
        className={`
          block w-7 h-3.5 rounded-full cursor-pointer transition-colors duration-200
          ${checked ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}
        `}
      >
        <span
          className={`
            absolute top-[2px] w-2.5 h-2.5 bg-white dark:bg-gray-200 rounded-full transition-transform duration-200
            ${checked ? 'translate-x-[16px]' : 'translate-x-[2px]'}
          `}
        />
      </label>
    </div>
  );
};

// Custom Select Component
const Select: React.FC<SelectProps> = ({ value, onChange, placeholder, options, disabled = false }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredOptions: SelectOption[] = options.filter((option: SelectOption) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption: SelectOption | undefined = options.find((opt: SelectOption) => opt.value === value);

  return (
    <div className="relative">
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          h-10 sm:h-12 px-4 text-base leading-6 rounded w-full cursor-pointer
          font-semibold bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600
          hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-700' : ''}
          ${isOpen ? 'border-blue-500 dark:border-blue-400' : ''}
        `}
      >
        <div className="flex items-center justify-between h-full">
          <span className={selectedOption ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 p-2">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              onClick={(e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-auto max-h-48">
            {filteredOptions.map((option: SelectOption) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className={`
                  px-4 py-3 cursor-pointer font-semibold text-gray-900 dark:text-gray-100
                  hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-colors
                  ${value === option.value ? 'bg-gray-100 dark:bg-gray-700' : ''}
                `}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Toast notification component
const Toast: React.FC<ToastProps> = ({ message, type = 'success', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer: NodeJS.Timeout = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`
      fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white
      transform transition-all duration-300 z-50
      ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
      ${type === 'success' ? 'bg-green-600 dark:bg-green-500' : 'bg-red-600 dark:bg-red-500'}
    `}>
      {message}
    </div>
  );
};

// Form Field Component
const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  placeholder,
  type = "text",
  prefix,
  icon: Icon,
  showToggle,
  toggleValue,
  onToggleChange,
  register,
  errors,
  onChange,
  onBlur,
  value
}) => {
  return (
    <div className="relative grid content-baseline gap-y-1">
      <div className="inline-block">
        <div className="flex items-end justify-between">
          <label htmlFor={id} className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal">
            <span className="cursor-default text-sm leading-5">
              <strong>{label}</strong>
            </span>
          </label>
          {showToggle && onToggleChange && (
            <div className="flex items-center gap-2">
              <span className="text-sm leading-5 text-gray-500 dark:text-gray-400">Show on resume</span>
              <ToggleSwitch
                id={`${id}-toggle`}
                checked={toggleValue || false}
                onChange={onToggleChange}
              />
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-row items-center">
        <div className="flex w-full flex-col gap-1">
          <div className={`
            h-10 sm:h-12 flex w-full flex-row items-center self-stretch
            border-2 rounded transition-all duration-200
            ${errors[id] ? 'border-red-500 dark:border-red-400' : 'border-gray-200 dark:border-gray-600 focus-within:border-blue-500 dark:focus-within:border-blue-400'}
            bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-1 gap-1
          `}>
            {Icon && <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-1" />}
            {prefix && (
              <span className="font-semibold whitespace-nowrap text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                {prefix}
              </span>
            )}
            <input
              id={id}
              type={type}
              placeholder={placeholder}
              className="bg-transparent text-gray-900 dark:text-gray-100 h-6 w-full border-0 px-1 text-base font-semibold leading-6 placeholder:text-gray-300 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0"
              {...register(id, (validationRules as any)[id] || {})}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
            />
            {id === 'linkedin' && (
              <Link2 className="h-5 w-5 cursor-pointer text-gray-900 dark:text-gray-100 hover:text-blue-500 dark:hover:text-blue-400" />
            )}
          </div>
          {errors[id] && (
            <p className="mt-1 text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors[id]?.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

function ContactForm({ initialData, onSave, autoSave = false }: ContactFormProps): JSX.Element {
  const {
    handleSubmit,
    register,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ContactFormData>({
    defaultValues: initialData,
    mode: 'onChange'
  });

  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ isVisible: false, message: '', type: 'success' });

  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  const selectedCountry: string = watch('country');
  const selectedState: string = watch('state');
  const selectedCity: string = watch('city');

  // Auto-detect state from city when city changes
  useEffect(() => {
    const cleanCity = cleanPlaceholderValue(selectedCity);
    if (cleanCity && cleanCity.trim() !== '') {
      const detectedState = CITY_TO_STATE[cleanCity];
      if (detectedState && selectedState !== detectedState) {
        setValue('state', detectedState, { shouldValidate: true });
        // Also set country to US if not already set or if it's a country name that maps to US
        const currentCountryCode = COUNTRY_NAME_TO_CODE[selectedCountry] || selectedCountry;
        if (!selectedCountry || selectedCountry.trim() === '' || currentCountryCode === 'US') {
          setValue('country', 'US', { shouldValidate: true });
        }
      }
    }
  }, [selectedCity, selectedState, selectedCountry, setValue]);

  // Auto-detect country based on state - runs immediately and on state changes
  useEffect(() => {
    if (selectedState && selectedState.trim() !== '') {
      const isUSState = US_STATES.some(state => state.value === selectedState);
      const isCanadaProvince = CANADA_PROVINCES.some(province => province.value === selectedState);

      // Convert current country name to code for comparison
      const currentCountryCode = COUNTRY_NAME_TO_CODE[selectedCountry] || selectedCountry;

      if (isUSState && currentCountryCode !== 'US') {
        setValue('country', 'US', { shouldValidate: true });
      } else if (isCanadaProvince && currentCountryCode !== 'CA') {
        setValue('country', 'CA', { shouldValidate: true });
      }
    }
  }, [selectedState, setValue]); // Removed selectedCountry from deps to prevent infinite loops

  // Clear state when country changes to incompatible country
  useEffect(() => {
    if (selectedState && selectedState.trim() !== '') {
      // Convert country name to code for comparison
      const countryCode = COUNTRY_NAME_TO_CODE[selectedCountry] || selectedCountry;

      if (countryCode === 'US') {
        const isValidUSState = US_STATES.some(state => state.value === selectedState);
        if (!isValidUSState) {
          setValue('state', '', { shouldValidate: true });
        }
      } else if (countryCode === 'CA') {
        const isValidCanadaProvince = CANADA_PROVINCES.some(province => province.value === selectedState);
        if (!isValidCanadaProvince) {
          setValue('state', '', { shouldValidate: true });
        }
      } else if (countryCode !== '' && countryCode !== 'US' && countryCode !== 'CA') {
        // Country is set to something other than US/CA, clear the state
        setValue('state', '', { shouldValidate: true });
      }
    }
  }, [selectedCountry, selectedState, setValue]);

  // Initial data processing - handle real-world data formats
  useEffect(() => {
    // Clean all form fields of placeholder values
    const formData = getValues();

    // Clean each field
    Object.keys(formData).forEach((key) => {
      const currentValue = formData[key as keyof ContactFormData];
      if (typeof currentValue === 'string') {
        const cleanedValue = cleanPlaceholderValue(currentValue);
        if (cleanedValue !== currentValue) {
          setValue(key as keyof ContactFormData, cleanedValue as any, { shouldValidate: true });
        }
      }
    });

    // After cleaning, get fresh values for processing
    const cleanFormData = getValues();
    const currentState = cleanFormData.state;
    const currentCountry = cleanFormData.country;
    const currentCity = cleanFormData.city;

    // Convert country name to country code if needed
    if (currentCountry && currentCountry.trim() !== '') {
      const countryCode = COUNTRY_NAME_TO_CODE[currentCountry] || currentCountry;
      if (countryCode !== currentCountry) {
        setValue('country', countryCode, { shouldValidate: true });
      }
    }

    // Auto-detect state from city if state is missing but we have a US city
    if (currentCity && currentCity.trim() !== '' && (!currentState || currentState.trim() === '')) {
      const detectedState = CITY_TO_STATE[currentCity];
      if (detectedState) {
        setValue('state', detectedState, { shouldValidate: true });
        // Also set country to US if not already set
        const finalCountry = getValues('country');
        if (!finalCountry || finalCountry.trim() === '' || COUNTRY_NAME_TO_CODE[finalCountry] === 'US') {
          setValue('country', 'US', { shouldValidate: true });
        }
      }
    }

    // Auto-detect country from state if state is present but country is missing/empty
    if (currentState && currentState.trim() !== '') {
      const finalCountry = getValues('country');
      if (!finalCountry || finalCountry.trim() === '') {
        const isUSState = US_STATES.some(state => state.value === currentState);
        const isCanadaProvince = CANADA_PROVINCES.some(province => province.value === currentState);

        if (isUSState) {
          setValue('country', 'US', { shouldValidate: true });
        } else if (isCanadaProvince) {
          setValue('country', 'CA', { shouldValidate: true });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount - getValues and setValue are stable from react-hook-form

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && isDirty) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }

      const timer: NodeJS.Timeout = setTimeout(async () => {
        try {
          await onSave(getValues());
          setToast({
            isVisible: true,
            message: 'Changes saved automatically',
            type: 'success'
          });
        } catch (error) {
          setToast({
            isVisible: true,
            message: 'Auto-save failed',
            type: 'error'
          });
        }
      }, 2000);

      setAutoSaveTimer(timer);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSave, isDirty, getValues, onSave, autoSaveTimer]);

  const onSubmit = async (data: ContactFormData): Promise<void> => {
    try {
      await onSave(data);
      setToast({
        isVisible: true,
        message: 'Contact information saved successfully',
        type: 'success'
      });
    } catch (error) {
      setToast({
        isVisible: true,
        message: 'Failed to save contact information',
        type: 'error'
      });
    }
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const cleanValue = cleanPlaceholderValue(e.target.value);
    const formatted: string = formatPhoneNumber(cleanValue);
    setValue('phone', formatted);
  };

  const handleFieldBlur = (fieldId: keyof ContactFormData) => (e: ChangeEvent<HTMLInputElement>): void => {
    const cleanValue = cleanPlaceholderValue(e.target.value);
    if (cleanValue !== e.target.value) {
      setValue(fieldId, cleanValue, { shouldValidate: true });
    }
  };

  const getStateOptions = (): SelectOption[] => {
    // Convert country name to code for comparison
    const countryCode = COUNTRY_NAME_TO_CODE[selectedCountry] || selectedCountry;

    if (countryCode === 'US') return US_STATES;
    if (countryCode === 'CA') return CANADA_PROVINCES;
    return [];
  };

  const getStateLabel = (): string => {
    // Convert country name to code for comparison
    const countryCode = COUNTRY_NAME_TO_CODE[selectedCountry] || selectedCountry;

    if (countryCode === 'US') return 'State';
    if (countryCode === 'CA') return 'Province';
    return 'State/Province';
  };

  return (
    <>
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4 lg:p-6 w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="relative">
          <div className="grid items-end gap-x-6 gap-y-4 sm:grid-cols-2">
            {/* Row 1: Full Name & Email */}
            <FormField
              id="fullName"
              label="Full name"
              placeholder="Charles Bloomberg"
              icon={null}
              register={register}
              errors={errors}
              onBlur={handleFieldBlur('fullName')}
              showToggle={false}
            />
            <FormField
              id="email"
              label="Email address"
              placeholder="charlesbloomberg@wisc.edu"
              type="email"
              icon={Mail}
              showToggle={false}
              register={register}
              errors={errors}
              onBlur={handleFieldBlur('email')}
            />

            {/* Row 2: Phone & LinkedIn */}
            <FormField
              id="phone"
              label="Phone number"
              placeholder="(621) 799-5548"
              type="tel"
              icon={Phone}
              showToggle={false}
              register={register}
              errors={errors}
              onChange={handlePhoneChange}
              value={watch('phone')}
            />
            <FormField
              id="linkedin"
              label="Linkedin URL"
              placeholder="bloomberg"
              prefix="https://linkedin.com/in/"
              icon={Linkedin}
              showToggle={false}
              register={register}
              errors={errors}
              onBlur={handleFieldBlur('linkedin')}
            />

            {/* Row 3: Website & Country */}
            <FormField
              id="website"
              label="Personal website or relevant link"
              placeholder="https://www.charlesbloomberg.com"
              type="url"
              icon={Globe}
              showToggle={false}
              register={register}
              errors={errors}
              onBlur={handleFieldBlur('website')}
            />
            <div className="relative grid gap-y-1">
              <div className="inline-block">
                <div className="flex items-end justify-between">
                  <label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal">
                    <span className="cursor-default text-sm leading-5">
                      <strong>Country</strong>
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm leading-5 text-gray-500 dark:text-gray-400">Show on resume</span>
                    <ToggleSwitch
                      id="country-toggle"
                      checked={watch('showLocation')}
                      onChange={(checked: boolean) => setValue('showLocation', checked)}
                    />
                  </div>
                </div>
              </div>
              <Select
                value={selectedCountry}
                onChange={(value: string) => setValue('country', value)}
                placeholder="Select country"
                options={COUNTRIES}
              />
            </div>

            {/* Row 4: State/Province & City */}
            <div className="relative grid gap-y-1">
              <div className="inline-block">
                <div className="flex items-end justify-between">
                  <label className="uppercase flex items-center text-gray-900 dark:text-gray-100 font-normal">
                    <span className="cursor-default text-sm leading-5">
                      <strong>{getStateLabel()}</strong>
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm leading-5 text-gray-500 dark:text-gray-400">Show on resume</span>
                    <ToggleSwitch
                      id="state-toggle"
                      checked={watch('showLocation')}
                      onChange={(checked: boolean) => setValue('showLocation', checked)}
                    />
                  </div>
                </div>
              </div>
              <Select
                value={selectedState}
                onChange={(value: string) => setValue('state', value)}
                placeholder={(() => {
                  const countryCode = COUNTRY_NAME_TO_CODE[selectedCountry] || selectedCountry;
                  return countryCode === 'US' || countryCode === 'CA'
                    ? `Select ${getStateLabel().toLowerCase()}`
                    : 'Select country first';
                })()}
                options={getStateOptions()}
                disabled={(() => {
                  const countryCode = COUNTRY_NAME_TO_CODE[selectedCountry] || selectedCountry;
                  return countryCode !== 'US' && countryCode !== 'CA';
                })()}
              />
            </div>
            <FormField
              id="city"
              label="City"
              placeholder="New York City"
              icon={MapPin}
              showToggle={true}
              toggleValue={watch('showLocation')}
              onToggleChange={(checked: boolean) => setValue('showLocation', checked)}
              register={register}
              errors={errors}
              onBlur={handleFieldBlur('city')}
            />
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                relative flex items-center justify-center font-bold uppercase
                transition-all duration-200 rounded-md
                px-4 py-2.5 h-10 text-sm w-full md:w-auto
                ${isSubmitting 
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-500 dark:hover:bg-blue-400 active:bg-blue-700 dark:active:bg-blue-600'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  <span>Save basic info</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </>
  );
}

export default ContactForm;