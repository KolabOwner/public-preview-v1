// components/auth/password-strength-indicator.tsx
import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

interface PasswordRequirement {
  regex: RegExp;
  text: string;
  met: boolean;
}

export function getPasswordStrength(password: string): {
  score: number;
  level: 'weak' | 'medium' | 'strong' | 'very-strong';
  color: string;
  requirements: PasswordRequirement[];
} {
  const requirements: PasswordRequirement[] = [
    {
      regex: /.{8,}/,
      text: 'At least 8 characters',
      met: false,
    },
    {
      regex: /[A-Z]/,
      text: 'One uppercase letter',
      met: false,
    },
    {
      regex: /[a-z]/,
      text: 'One lowercase letter',
      met: false,
    },
    {
      regex: /[0-9]/,
      text: 'One number',
      met: false,
    },
    {
      regex: /[^A-Za-z0-9]/,
      text: 'One special character',
      met: false,
    },
  ];

  let score = 0;
  requirements.forEach((req) => {
    if (req.regex.test(password)) {
      req.met = true;
      score++;
    }
  });

  // Bonus points for length
  if (password.length >= 12) score += 0.5;
  if (password.length >= 16) score += 0.5;

  let level: 'weak' | 'medium' | 'strong' | 'very-strong';
  let color: string;

  if (score < 2) {
    level = 'weak';
    color = '#ef4444'; // red-500
  } else if (score < 3.5) {
    level = 'medium';
    color = '#f59e0b'; // amber-500
  } else if (score < 5) {
    level = 'strong';
    color = '#10b981'; // emerald-500
  } else {
    level = 'very-strong';
    color = '#059669'; // emerald-600
  }

  return { score: Math.min(score, 6), level, color, requirements };
}

export function PasswordStrengthIndicator({
  password,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  const { score, level, color, requirements } = getPasswordStrength(password);
  const percentage = (score / 6) * 100;

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">Password strength</span>
          <span 
            className="text-xs font-medium capitalize"
            style={{ color }}
          >
            {level.replace('-', ' ')}
          </span>
        </div>
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 ease-out rounded-full"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <div className="space-y-1" role="list" aria-label="Password requirements">
          {requirements.map((req, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 text-xs transition-colors ${
                req.met ? 'text-emerald-400' : 'text-gray-500'
              }`}
              role="listitem"
            >
              {req.met ? (
                <Check className="w-3 h-3" aria-hidden="true" />
              ) : (
                <X className="w-3 h-3" aria-hidden="true" />
              )}
              <span>{req.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}