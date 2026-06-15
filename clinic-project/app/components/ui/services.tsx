// app/components/ui/Services.tsx
import { services } from '../contect/clinicInfo';

export default function Services() {
  return (
    <section id="services" className="section bg-white">
      <div className="container">
        <div className="text-center mb-20">
          <div className="inline-block bg-[var(--color-primary-lighter)] text-[var(--color-primary)] px-6 py-2 rounded-full text-sm mb-4 font-medium">
            خدمات تخصصی
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5">خدمات ما</h2>
          <p className="text-[var(--color-text-light)] max-w-md mx-auto text-lg">
            مراقبت کامل و حرفه‌ای در زمینه بهداشت زنان و مامایی
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="group card-hover bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:border-[var(--color-primary-lighter)] transition-all">
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300 inline-block">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[var(--color-text-dark)]">{service.title}</h3>
              <p className="text-[var(--color-text-light)] leading-relaxed">{service.desc}</p>
              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[var(--color-primary)] text-sm font-medium">بیشتر بدانید ←</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}