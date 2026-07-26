// app/components/ui/Stats.tsx
'use client';

import { clinicInfo } from '../contect/clinicInfo';
import { Award, Users, Calendar, Heart } from 'lucide-react';

export default function Stats() {
  const stats = [
    {
      icon: <Award className="text-[var(--color-primary)]" size={32} />,
      value: `${clinicInfo.experience}+`,
      label: 'سال تجربه',
    },
    {
      icon: <Users className="text-[var(--color-primary)]" size={32} />,
      value: `${clinicInfo.patients}+`,
      label: 'بیمار راضی',
    },
    {
      icon: <Calendar className="text-[var(--color-primary)]" size={32} />,
      value: '۸ ساعت',
      label: 'پذیرش در هفته',
    },
    {
      icon: <Heart className="text-[var(--color-primary)]" size={32} />,
      value: '۱۰۰%',
      label: 'رضایت بیماران',
    },
  ];

  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-3">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold text-[var(--color-text-dark)]">
                {stat.value}
              </div>
              <div className="text-sm text-[var(--color-text-light)] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}