# 🇪🇬 EGX Live – البورصة المصرية لايف

أسعار لحظية حقيقية من Yahoo Finance + تحليل AI بالكلود

---

## 📁 هيكل المشروع

```
egx-live/
├── server.js        ← السيرفر (يرفع على Render)
├── package.json     ← اعدادات Node.js
├── render.yaml      ← اعدادات Render تلقائية
├── data.js          ← بيانات الأسهم الأساسية
└── public/
    ├── index.html   ← الصفحة الرئيسية
    ├── stock.html   ← صفحة كل سهم
    └── data.js      ← نسخة للـ frontend
```

---

## 🚀 خطوات الرفع على Render (مجاناً)

### الخطوة 1 – GitHub
1. افتح [github.com](https://github.com) وسجل دخول (أو أنشئ حساب مجاناً)
2. اضغط **New repository** → اسمه `egx-live`
3. اختار **Public** → اضغط **Create repository**
4. ارفع كل ملفات المشروع ده (drag & drop في المتصفح)

### الخطوة 2 – Render
1. افتح [render.com](https://render.com) وسجل دخول بحساب GitHub
2. اضغط **New** → **Web Service**
3. اختار الـ repository `egx-live`
4. الإعدادات:
   - **Name:** egx-live-api
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. اضغط **Create Web Service**
6. انتظر 2-3 دقيقة → هتحصل على رابط زي:
   ```
   https://egx-live-api.onrender.com
   ```

### الخطوة 3 – تشغيل الصفحة
1. افتح `public/index.html` في المتصفح
2. في الخانة في الأعلى، ضع رابط Render:
   ```
   https://egx-live-api.onrender.com
   ```
3. اضغط **حفظ واتصال**
4. ✅ الأسعار هتبدأ تتحدث كل 10 ثواني!

---

## ⚠️ ملاحظات مهمة

- **Render Free Plan:** السيرفر بيـ"ينام" بعد 15 دقيقة من عدم الاستخدام
  - أول طلب بعد النوم بياخد ~30 ثانية عشان يصحى
  - بعدها بيشتغل عادي
- **Yahoo Finance:** بيانات مجانية لكن متأخرة 15 دقيقة عن السوق الحقيقي
- **أثناء إغلاق البورصة:** الأسعار هتبقى ثابتة (آخر إغلاق)

---

## 🔄 البيانات اللي بتيجي لايف

- ✅ السعر الحالي
- ✅ التغير اليومي (جنيه و%)
- ✅ أعلى/أدنى اليوم
- ✅ أعلى/أدنى 52 أسبوع
- ✅ حجم التداول
- ✅ القيمة السوقية
- ✅ P/E و EPS
- ✅ إشارة الشراء/البيع (محسوبة تلقائياً)

---

⚠️ **تنبيه:** هذا المشروع لأغراض تعليمية فقط وليس نصيحة استثمارية.
