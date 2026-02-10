// Final TS Fix
import { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { PageType } from '../../App';
import { useAuth } from '../../contexts/AuthContext';

interface AuthPageProps {
  defaultIsLogin?: boolean;
  onNavigate: (page: PageType) => void;
}

export default function AuthPage({ defaultIsLogin = true, onNavigate }: AuthPageProps) {
  const { loginWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: ''
  });
  const [rememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('الرجاء ملء جميع الحقول المطلوبة');
      return false;
    }

    if (!isLogin) {
      if (!formData.displayName) {
        setError('الرجاء إدخال الاسم');
        return false;
      }
      if (formData.password.length < 6) {
        setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('كلمات المرور غير متطابقة');
        return false;
      }
    }

    return true;
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await loginWithGoogle();
      if (result.success) {
        onNavigate('home');
      } else {
        setError(result.error || 'فشل تسجيل الدخول باستخدام Google');
      }
    } catch (err) {
      console.error('Google login error:', err);
      setError('حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistenceType);

      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        onNavigate('home');
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );

        await updateProfile(userCredential.user, {
          displayName: formData.displayName
        });

        onNavigate('home');
      }
    } catch (err) {
      const authError = err as { code?: string; message?: string };
      console.error('Auth error:', err);
      
      let errorMessage = 'حدث خطأ، الرجاء المحاولة مرة أخرى';
      
      switch (authError.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'هذا البريد الإلكتروني مستخدم بالفعل';
          break;
        case 'auth/invalid-email':
          errorMessage = 'البريد الإلكتروني غير صالح';
          break;
        case 'auth/user-not-found':
          errorMessage = 'المستخدم غير موجود';
          break;
        case 'auth/wrong-password':
          errorMessage = 'كلمة المرور غير صحيحة';
          break;
        case 'auth/weak-password':
          errorMessage = 'كلمة المرور ضعيفة جداً';
          break;
        default:
          errorMessage = authError.message || 'فشلت العملية';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#00D4D4]/[0.03] rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#00D4D4]/[0.05] rounded-full blur-[100px]" />

      <div className="w-full max-w-[480px] z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-white border border-[#0A0A0A]/[0.04] rounded-[22px] flex items-center justify-center shadow-[0px_10px_20px_rgba(0,0,0,0.04)] mb-4">
            <div className="w-10 h-10 bg-[#00D4D4] rounded-xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <h1 className="text-[32px] font-bold tracking-tight text-[#0A0A0A]">
            {isLogin ? 'Pulsor' : 'Join Pulsor'}
          </h1>
          <p className="text-[#0A0A0A]/40 font-medium mt-1">
            {isLogin ? 'Welcome back! Please enter your details.' : 'Start your creative journey today.'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0px_20px_50px_rgba(0,0,0,0.08)] rounded-[32px] p-8 md:p-10 mb-6">
          
          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-14 bg-white border border-[#0A0A0A]/[0.1] rounded-[18px] font-bold text-[15px] text-[#0A0A0A] hover:bg-[#F8F9FA] transition-all flex items-center justify-center gap-3 mb-6"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4"/>
              <path d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z" fill="#34A853"/>
              <path d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z" fill="#FBBC05"/>
              <path d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute w-full h-[1px] bg-[#0A0A0A]/[0.06]"></div>
            <span className="relative bg-[#FFFFFF] px-4 text-[12px] font-bold text-[#0A0A0A]/40 uppercase tracking-widest">
              OR CONTINUE WITH
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#0A0A0A]/40 ml-1">FULL NAME</label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full h-14 px-5 bg-white border border-[#0A0A0A]/[0.06] rounded-[18px] outline-none focus:border-[#00D4D4] focus:ring-4 focus:ring-[#00D4D4]/5 transition-all font-medium text-[15px]"
                  disabled={loading}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#0A0A0A]/40 ml-1">EMAIL ADDRESS</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                className="w-full h-14 px-5 bg-white border border-[#0A0A0A]/[0.06] rounded-[18px] outline-none focus:border-[#00D4D4] focus:ring-4 focus:ring-[#00D4D4]/5 transition-all font-medium text-[15px]"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[13px] font-bold text-[#0A0A0A]/40">PASSWORD</label>
                {isLogin && (
                  <button 
                    type="button"
                    onClick={() => onNavigate('forgot-password')}
                    className="text-[13px] font-bold text-[#00D4D4] hover:opacity-80 transition-opacity"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full h-14 px-5 bg-white border border-[#0A0A0A]/[0.06] rounded-[18px] outline-none focus:border-[#00D4D4] focus:ring-4 focus:ring-[#00D4D4]/5 transition-all font-medium text-[15px]"
                disabled={loading}
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#0A0A0A]/40 ml-1">CONFIRM PASSWORD</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full h-14 px-5 bg-white border border-[#0A0A0A]/[0.06] rounded-[18px] outline-none focus:border-[#00D4D4] focus:ring-4 focus:ring-[#00D4D4]/5 transition-all font-medium text-[15px]"
                  disabled={loading}
                />
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-[16px] flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <p className="text-[13px] font-bold text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#0A0A0A] text-white rounded-[18px] font-bold text-[15px] shadow-[0px_10px_20px_rgba(0,0,0,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#0A0A0A]/[0.04] text-center">
            <p className="text-[#0A0A0A]/40 font-bold text-[13px]">
              {isLogin ? "DON'T HAVE AN ACCOUNT?" : "ALREADY HAVE AN ACCOUNT?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 text-[#00D4D4] hover:opacity-80 transition-opacity"
              >
                {isLogin ? 'CREATE ONE' : 'SIGN IN'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="flex justify-center gap-6">
          <button className="text-[12px] font-bold text-[#0A0A0A]/30 hover:text-[#0A0A0A]/60 transition-colors">PRIVACY POLICY</button>
          <button className="text-[12px] font-bold text-[#0A0A0A]/30 hover:text-[#0A0A0A]/60 transition-colors">TERMS OF SERVICE</button>
        </div>
      </div>
    </div>
  );
}
