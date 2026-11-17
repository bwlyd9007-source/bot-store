import { SectionHeading } from "@/components/section-heading";

const steps = [
  {
    title: "تواصل معنا",
    description: "أخبرنا باحتياجك عبر ديسكورد أو واتساب، ونجيبك بسرعة.",
  },
  {
    title: "الاتفاق والدفع",
    description: "نحدد الميزات والسعر والمدة بوضوح قبل البدء.",
  },
  {
    title: "التنفيذ",
    description: "نبني ونختبر البوت أو التصميم ونشاركك التقدم.",
  },
  {
    title: "التسليم والدعم",
    description: "نسلّم البوت جاهزاً ونبقى معك للدعم والتحديثات.",
  },
];

export function Process() {
  return (
    <section id="how" className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          kicker="كيف نعمل"
          title="من الفكرة إلى بوت شغّال"
          description="أربع خطوات واضحة بدون مفاجآت — تعرف السعر والمدة قبل ما نبدأ."
        />

        <div className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute inset-x-16 top-7 hidden h-px bg-gradient-to-l from-transparent via-white/10 to-transparent lg:block" />

          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              <span className="relative grid size-14 place-items-center rounded-2xl border border-accent/25 bg-night-2 text-xl font-extrabold text-accent shadow-[0_0_35px_-12px_rgba(53,213,239,0.7)]">
                {index + 1}
              </span>
              <h3 className="mt-5 text-lg font-extrabold">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-white/50">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
