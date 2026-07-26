// app/documents/page.tsx
import { clinicInfo } from '../components/contect/clinicInfo';
import Image from 'next/image';
import { FileText, Award, BadgeCheck, GraduationCap, Stethoscope, Calendar, CheckCircle } from 'lucide-react';

export default function DocumentsPage() {
  const documents = [
    {
      id: 1,
      icon: <GraduationCap className="text-[var(--color-primary)]" size={32} />,
      title: 'مدرک تحصیلی',
      description: 'کارشناسی مامایی از دانشگاه علوم پزشکی اصفهان',
      year: '۱۳۸۵',
      image: '/images/documents/degree.jpg', // مسیر تصویر
    },
    {
      id: 2,
      icon: <BadgeCheck className="text-[var(--color-primary)]" size={32} />,
      title: 'پروانه نظام پزشکی',
      description: `شماره پروانه: ${clinicInfo.license}`,
      year: '۱۳۸۶',
      image: '/images/documents/license.jpg',
    },
    {
      id: 3,
      icon: <Award className="text-[var(--color-primary)]" size={32} />,
      title: 'دوره‌های تخصصی',
      description: 'مراقبت‌های پیشرفته بارداری، مشاوره قبل از بارداری',
      year: '۱۳۹۰',
      image: '/images/documents/certificates.jpg',
    },
    {
      id: 4,
      icon: <Stethoscope className="text-[var(--color-primary)]" size={32} />,
      title: 'همکاری با بیمارستان‌ها',
      description: `بیمارستان‌های ${clinicInfo.hospitals.join(' و ')}`,
      year: '۱۳۸۵ تا کنون',
      image: '/images/documents/hospitals.jpg',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] py-16">
      <div className="container max-w-5xl mx-auto px-4">
        {/* هدر صفحه */}
        <div className="text-center mb-16">
          <div className="inline-block bg-[var(--color-primary-lighter)] text-[var(--color-primary)] px-6 py-2 rounded-full text-sm mb-4 font-medium">
            مدارک و گواهینامه‌ها
          </div>
          <h1 className="text-4xl font-bold mb-4">مدارک و افتخارات</h1>
          <p className="text-[var(--color-text-light)] max-w-2xl mx-auto text-lg leading-relaxed">
            خانم فرشته صادقی، کارشناس مامایی با بیش از {clinicInfo.experience} سال تجربه در زمینه بهداشت زنان و مامایی
          </p>
        </div>

        {/* لیست مدارک */}
        <div className="space-y-8">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="grid md:grid-cols-4 gap-6 p-6">
                {/* آیکون */}
                <div className="flex flex-col items-center justify-center p-4 bg-[var(--color-primary-bg)] rounded-2xl">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md">
                    {doc.icon}
                  </div>
                  <div className="mt-3 text-center">
                    <div className="text-sm text-[var(--color-text-light)]">سال</div>
                    <div className="font-bold text-[var(--color-primary)]">{doc.year}</div>
                  </div>
                </div>

                {/* اطلاعات */}
                <div className="md:col-span-3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                      {doc.title}
                      <CheckCircle size={18} className="text-green-500" />
                    </h3>
                    <p className="text-[var(--color-text-light)] leading-relaxed">
                      {doc.description}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-sm text-[var(--color-text-light)] border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-1">
                      <FileText size={16} />
                      <span>مدرک معتبر</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BadgeCheck size={16} className="text-[var(--color-primary)]" />
                      <span>تأیید شده</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* تصویر مدرک (اگر موجود باشد) */}
              <div className="px-6 pb-6">
                <div className="bg-gray-100 rounded-2xl p-4 text-center text-[var(--color-text-light)] border-2 border-dashed border-gray-200">
                  <div className="text-sm">
                    📎 تصویر مدرک در نسخه نهایی قرار خواهد گرفت
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* اطلاعات تکمیلی */}
        <div className="mt-16 bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-center">افتخارات و سوابق</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-[var(--color-primary-bg)] rounded-2xl">
              <div className="text-4xl font-bold text-[var(--color-primary)]">{clinicInfo.experience}+</div>
              <div className="text-sm text-[var(--color-text-light)]">سال تجربه</div>
            </div>
            <div className="text-center p-4 bg-[var(--color-primary-bg)] rounded-2xl">
              <div className="text-4xl font-bold text-[var(--color-primary)]">{clinicInfo.patients}+</div>
              <div className="text-sm text-[var(--color-text-light)]">بیمار راضی</div>
            </div>
            <div className="text-center p-4 bg-[var(--color-primary-bg)] rounded-2xl">
              <div className="text-4xl font-bold text-[var(--color-primary)]">۱۰+</div>
              <div className="text-sm text-[var(--color-text-light)]">دوره‌های تخصصی</div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-[var(--color-text-light)] text-sm">
              تمامی مدارک و گواهینامه‌ها توسط نظام پزشکی و وزارت بهداشت تأیید شده‌اند.
            </p>
          </div>
        </div>

        {/* دکمه بازگشت */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline"
          >
            ← بازگشت به صفحه اصلی
          </a>
        </div>
      </div>
    </div>
  );
}