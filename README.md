# BOT STORE

متجر بوتات وخدمات ديسكورد — صفحة عرض عربية (RTL) مبنية بـ Next.js 16 وTailwind CSS 4، مع كتالوج بوتات وفلاتر، وباقات خدمات، ونافذة طلب عبر ديسكورد أو واتساب.

## التشغيل

يتطلب Node.js 20 أو أحدث.

```bash
npm install
npm run dev
```

افتح http://localhost:3000 — للنسخة الإنتاجية: `npm run build` ثم `npm start`.

## التخصيص

| ماذا تغيّر | أين |
| --- | --- |
| رابط ديسكورد، رقم واتساب، البريد | `lib/site.ts` |
| البوتات، الأسعار، الميزات، الخدمات | `lib/products.ts` |
| الصورة الرئيسية | `public/bot-mascot.png` |
| الألوان والخطوط والثيم | `app/globals.css` و`app/layout.tsx` |

## البنية

- `app/page.tsx` — تجميع أقسام الصفحة
- `components/hero.tsx` — الواجهة الرئيسية
- `components/product-catalog.tsx` — كتالوج البوتات والفلاتر
- `components/services.tsx` — باقات الخدمات
- `components/process.tsx` — خطوات العمل
- `components/faq.tsx` — الأسئلة الشائعة
- `components/order.tsx` — نافذة الطلب (Context + Dialog)
- `components/site-header.tsx` — الهيدر وقائمة الجوال
- `components/site-footer.tsx` — الفوتر
