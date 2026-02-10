import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { PageType } from '../../App';

interface ForgotPasswordPageProps {
  onNavigate: (page: PageType) => void;
}

export default function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('الرجاء إدخال البريد الإلكتروني');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      const resetError = err as { code?: string; message?: string };
      console.error('Reset error:', err);
      
      let errorMessage = 'حدث خطأ، الرجاء المحاولة مرة أخرى';
      if (resetError.code === 'auth/user-not-found') {
        errorMessage = 'المستخدم غير موجود';
      } else if (resetError.code === 'auth/invalid-email') {
        errorMessage = 'البريد الإلكتروني غير صالح';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#00D4D4]/[0.03] rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#00D4D4]/[0.05] rounded-full blur-[100px]" />

      <div className="w-full max-w-[480px] z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-white border border-[#0A0A0A]/[0.04] rounded-[22px] flex items-center justify-center shadow-[0px_10px_20px_rgba(0,0,0,0.04)] mb-4">
            <div className="w-10 h-10 bg-[#00D4D4] rounded-xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 15V17M12 7V13M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <h1 className="text-[32px] font-bold tracking-tight text-[#0A0A0A]">
            Reset Password
          </h1>
          <p className="text-[#0A0A0A]/40 font-medium mt-1 px-4">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0px_20px_50px_rgba(0,0,0,0.08)] rounded-[32px] p-8 md:p-10 mb-6">
          {success ? (
            <div className="text-center py-6 space-y-6">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-[20px] font-bold text-[#0A0A0A]">Check your email</h3>
                <p className="text-[#0A0A0A]/40 font-medium mt-2">
                  We've sent a password reset link to <br/>
                  <span className="text-[#0A0A0A]">{email}</span>
                </p>
              </div>
              <button
                onClick={() => onNavigate('login')}
                className="w-full h-14 bg-[#0A0A0A] text-white rounded-[18px] font-bold text-[15px] shadow-[0px_10px_20px_rgba(0,0,0,0.1)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Return to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#0A0A0A]/40 ml-1">EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-14 px-5 bg-white border border-[#0A0A0A]/[0.06] rounded-[18px] outline-none focus:border-[#00D4D4] focus:ring-4 focus:ring-[#00D4D4]/5 transition-all font-medium text-[15px]"
                  disabled={loading}
                />
              </div>

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
                    <span>Sending...</span>
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="w-full text-center text-[#0A0A0A]/40 font-bold text-[13px] hover:text-[#0A0A0A]/60 transition-colors"
              >
                BACK TO LOGIN
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
