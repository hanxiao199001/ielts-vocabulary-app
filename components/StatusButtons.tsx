'use client';

import { Check, X, RotateCcw } from 'lucide-react';
import { LearnStatus } from '@/types';

interface StatusButtonsProps {
  currentStatus?: LearnStatus;
  onStatusChange: (status: LearnStatus) => void;
  disabled?: boolean;
}

export default function StatusButtons({
  currentStatus,
  onStatusChange,
  disabled = false,
}: StatusButtonsProps) {
  const buttons = [
    {
      status: 'known' as LearnStatus,
      label: '认识',
      icon: Check,
      color: 'bg-green-500 hover:bg-green-600',
      activeColor: 'bg-green-600 ring-4 ring-green-300',
    },
    {
      status: 'unknown' as LearnStatus,
      label: '不认识',
      icon: X,
      color: 'bg-red-500 hover:bg-red-600',
      activeColor: 'bg-red-600 ring-4 ring-red-300',
    },
    {
      status: 'review' as LearnStatus,
      label: '需复习',
      icon: RotateCcw,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      activeColor: 'bg-yellow-600 ring-4 ring-yellow-300',
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {buttons.map(({ status, label, icon: Icon, color, activeColor }) => {
        const isActive = currentStatus === status;

        return (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
            disabled={disabled}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
              isActive ? activeColor : color
            }`}
            aria-label={label}
            aria-pressed={isActive}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
