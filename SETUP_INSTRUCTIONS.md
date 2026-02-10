# 🚀 Setup Instructions - Login/Signup Pages

## ✅ ما تم إنشاؤه:

### 1. **صفحات المصادقة** 📄
- ✨ `src/pages/auth/AuthPage.jsx` - صفحة Login/Signup جميلة
- 🔑 `src/pages/auth/ForgotPasswordPage.jsx` - صفحة استعادة كلمة المرور

### 2. **Firebase Configuration** 🔥
- ⚙️ `src/config/firebase.js` - إعدادات Firebase
- 🔐 `src/contexts/AuthContext.jsx` - Context للمصادقة
- 🛡️ `src/components/ProtectedRoute.jsx` - حماية الصفحات

### 3. **Routing** 🛣️
- 📱 `src/App.tsx` - تم تحديثه لاستخدام React Router
- 🔄 Routes للصفحات العامة والمحمية

---

## 📦 خطوات التثبيت:

### الخطوة 1: تثبيت المكتبات المطلوبة
```bash
npm install
```

### الخطوة 2: إنشاء ملف `.env`
قم بنسخ `.env.example` وإعادة تسميته إلى `.env`:

```bash
cp .env.example .env
```

### الخطوة 3: إضافة بيانات Firebase
افتح ملف `.env` وأضف بيانات Firebase الخاصة بك:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyCmB9xG09J-5tLSpmZ3Oyppm2DQvU6n0FE
VITE_FIREBASE_AUTH_DOMAIN=saas-adforge.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=saas-adforge
VITE_FIREBASE_STORAGE_BUCKET=saas-adforge.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=599347477659
VITE_FIREBASE_APP_ID=1:599347477659:web:fcb23a7dfc762412005a3e
VITE_FIREBASE_MEASUREMENT_ID=G-D8Z4H2Q8H6

# Backend API
VITE_API_BASE_URL=http://localhost:8000/
```

### الخطوة 4: تشغيل التطبيق
```bash
npm run dev
```

### الخطوة 5: افتح المتصفح
انتقل إلى: **http://localhost:3000/auth**

---

## 🎨 الميزات المتوفرة:

### صفحة Login/Signup:
- ✅ تبديل سلس بين Login و Signup
- ✅ تصميم modern و responsive
- ✅ Validation كامل للحقول
- ✅ Remember Me functionality
- ✅ رسائل أخطاء واضحة بالعربية
- ✅ Loading states
- ✅ Password strength validation

### صفحة Forgot Password:
- ✅ إرسال رابط reset password
- ✅ Success message بعد الإرسال
- ✅ رابط للعودة للـ Login

### الأمان:
- 🔒 Firebase Authentication
- 🔒 Session persistence (Remember Me)
- 🔒 Protected Routes
- 🔒 Auto token refresh
- 🔒 Error handling مع retry logic

---

## 🗺️ الـ Routes المتاحة:

| Route | الوصف | حماية |
|-------|-------|------|
| `/auth` | صفحة Login/Signup | عامة |
| `/forgot-password` | استعادة كلمة المرور | عامة |
| `/` | الصفحة الرئيسية | محمية ✅ |
| `/products` | Products | محمية ✅ |
| `/ai-avatars` | AI Avatars | محمية ✅ |
| `/ads-library` | Ads Library | محمية ✅ |
| `/settings` | Settings | محمية ✅ |

---

## 🔧 حل المشاكل الشائعة:

### مشكلة: Firebase not configured
**الحل:** تأكد من ملء جميع متغيرات البيئة في `.env`

### مشكلة: Module not found
**الحل:** قم بتشغيل `npm install` مرة أخرى

### مشكلة: Port already in use
**الحل:** غير الـ port في `vite.config.ts` أو أغلق التطبيق الذي يستخدم Port 3000

---

## 📱 الاستخدام:

### تسجيل حساب جديد:
1. اذهب إلى `/auth`
2. اضغط "إنشاء حساب جديد"
3. املأ البيانات (الاسم، البريد، كلمة المرور)
4. اضغط "إنشاء حساب"
5. سيتم تحويلك تلقائياً للصفحة الرئيسية

### تسجيل الدخول:
1. اذهب إلى `/auth`
2. أدخل البريد وكلمة المرور
3. اختر "تذكرني" إذا أردت (optional)
4. اضغط "تسجيل الدخول"

### نسيت كلمة المرور:
1. اضغط "نسيت كلمة المرور؟" في صفحة Login
2. أدخل بريدك الإلكتروني
3. ستستلم رابط reset في بريدك

---

## 🎉 جاهز للاستخدام!

التطبيق الآن جاهز مع نظام مصادقة كامل! 🚀
