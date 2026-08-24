import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { isEmail } from '@/lib/format';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import { Checkbox, Input } from '@/components/ui/Field';
import { EyeIcon } from '@/components/ui/icons';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const signIn = useAuthStore((s) => s.signIn);
  const setKeepLogin = useAuthStore((s) => s.setKeepLogin);
  const showToast = useUiStore((s) => s.showToast);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  // 이전에 저장된 선택을 그대로 보여준다
  const [keep, setKeep] = useState(() => useAuthStore.getState().keepLogin);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!isEmail(email) || password.length === 0) {
      setError('이메일 또는 비밀번호가 일치하지 않습니다');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      setKeepLogin(keep);
      signIn(user);
      const from = (location.state as { from?: string } | null)?.from ?? '/';
      navigate(from, { replace: true });
    } catch (e) {
      // 인증 실패와 일시적 오류를 구분한다 (화면정책서 §0 / §6.1)
      setError(
        e instanceof Error && e.message === 'INVALID_CREDENTIALS'
          ? '이메일 또는 비밀번호가 일치하지 않습니다'
          : '일시적인 오류입니다. 다시 시도해 주세요',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="로그인" hideFooter>
      <div className="mx-auto w-full max-w-[400px] px-6 pb-14 pt-14 lg:pt-20">
        <div className="flex flex-col items-center gap-2.5">
          <span className="text-[26px] font-bold tracking-[.14em] text-ink-900 lg:text-[28px]">MINIM.</span>
          <span className="text-micro tracking-[.16em] text-ink-500">2026 AUTUMN COLLECTION</span>
        </div>

        <form
          className="mt-11 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <Input
            label="이메일"
            type="email"
            autoComplete="email"
            placeholder="example@minim.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="비밀번호"
            type={visible ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="비밀번호를 입력해 주세요"
            value={password}
            error={error}
            onChange={(e) => setPassword(e.target.value)}
            suffix={
              <button
                type="button"
                aria-label="비밀번호 표시"
                onClick={() => setVisible((v) => !v)}
                className="flex-none text-ink-400"
              >
                <EyeIcon />
              </button>
            }
          />
          <Checkbox checked={keep} onChange={setKeep} label="로그인 상태 유지" />
          <Button type="submit" size="lg" fullWidth loading={loading} className="mt-2">
            로그인
          </Button>
        </form>

        <p className="mt-4 text-center text-micro text-ink-500">
          테스트 계정 · 아무 이메일 / 비밀번호 <span className="text-ink-700">minim1234</span>
        </p>

        <div className="mt-4 flex justify-center gap-4 text-caption text-ink-500">
          <Link to="/signup" className="hover:text-ink-900">
            회원가입
          </Link>
          <span className="text-ink-300">|</span>
          <button type="button" onClick={() => showToast('준비 중입니다')} className="hover:text-ink-900">
            비밀번호 찾기
          </button>
        </div>

        <div className="my-9 flex items-center gap-3.5">
          <span className="h-px flex-1 bg-ink-200" />
          <span className="text-micro tracking-widest text-ink-500">또는</span>
          <span className="h-px flex-1 bg-ink-200" />
        </div>

        <div className="flex flex-col gap-2.5">
          {['Kakao', 'Naver', 'Google'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => showToast('준비 중입니다')}
              className="flex h-12 items-center justify-center border border-ink-200 text-body-sm text-ink-500 transition-colors duration-fast hover:border-ink-300"
            >
              {p}로 계속하기
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}
