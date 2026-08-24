import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { cx, formatPhone, isEmail, isName, isPhone, isPassword, passwordStrength } from '@/lib/format';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import { Checkbox, Input } from '@/components/ui/Field';
import { EyeIcon } from '@/components/ui/icons';

const STRENGTH_LABEL = ['', '약함', '보통', '강함'];

type Errors = Partial<Record<'email' | 'password' | 'confirm' | 'name' | 'phone' | 'agree', string>>;

export default function SignupPage() {
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signIn);
  const setKeepLogin = useAuthStore((s) => s.setKeepLogin);
  const showToast = useUiStore((s) => s.showToast);

  const [form, setForm] = useState({ email: '', password: '', confirm: '', name: '', phone: '' });
  const [visible, setVisible] = useState(false);
  const [agree, setAgree] = useState({ terms: false, privacy: false, marketing: false });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(form.password);
  const allAgreed = agree.terms && agree.privacy && agree.marketing;

  const validateField = (key: keyof typeof form) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (key === 'email') {
        next.email = isEmail(form.email) ? undefined : '이메일 형식이 올바르지 않습니다';
      }
      if (key === 'password') {
        next.password = isPassword(form.password) ? undefined : '영문·숫자 포함 8자 이상 입력해 주세요';
      }
      if (key === 'confirm') {
        next.confirm = form.confirm === form.password ? undefined : '비밀번호가 일치하지 않습니다';
      }
      if (key === 'name') next.name = isName(form.name) ? undefined : '이름을 입력해 주세요';
      if (key === 'phone') next.phone = isPhone(form.phone) ? undefined : '휴대폰 번호를 정확히 입력해 주세요';
      return next;
    });
  };

  const submit = async () => {
    const next: Errors = {};
    if (!isEmail(form.email)) next.email = '이메일 형식이 올바르지 않습니다';
    if (!isPassword(form.password)) next.password = '영문·숫자 포함 8자 이상 입력해 주세요';
    if (form.confirm !== form.password) next.confirm = '비밀번호가 일치하지 않습니다';
    if (!isName(form.name)) next.name = '이름을 입력해 주세요';
    if (!isPhone(form.phone)) next.phone = '휴대폰 번호를 정확히 입력해 주세요';
    if (!agree.terms || !agree.privacy) next.agree = '필수 약관에 동의해 주세요';

    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setLoading(true);
    try {
      const user = await signup(form);
      // 가입 직후에는 로그인 상태를 유지한다
      setKeepLogin(true);
      signIn(user);
      showToast('가입을 환영합니다');
      navigate('/', { replace: true });
    } catch (e) {
      if (e instanceof Error && e.message === 'DUPLICATED_EMAIL') {
        setErrors({ email: '이미 사용 중인 이메일입니다' });
      } else {
        showToast('일시적인 오류입니다. 다시 시도해 주세요');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="회원가입" hideFooter>
      <div className="mx-auto w-full max-w-[400px] px-6 pb-14 pt-7 lg:pt-16">
        <h1 className="hidden text-h1-lg text-ink-900 lg:mb-8 lg:block">회원가입</h1>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <Input
            label="이메일"
            required
            type="email"
            placeholder="example@minim.com"
            value={form.email}
            error={errors.email}
            onBlur={() => validateField('email')}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />

          <div className="flex flex-col gap-2">
            <Input
              label="비밀번호"
              required
              type={visible ? 'text' : 'password'}
              placeholder="영문·숫자 포함 8자 이상"
              value={form.password}
              error={errors.password}
              onBlur={() => validateField('password')}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
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
            {form.password && (
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((n) => (
                  <span
                    key={n}
                    className={cx('h-1 w-8', n <= strength ? 'bg-ink-600' : 'bg-ink-200')}
                  />
                ))}
                <span className="ml-1.5 text-micro text-ink-500">{STRENGTH_LABEL[strength]}</span>
              </div>
            )}
          </div>

          <Input
            label="비밀번호 확인"
            required
            type={visible ? 'text' : 'password'}
            value={form.confirm}
            error={errors.confirm}
            onBlur={() => validateField('confirm')}
            onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
          />
          <Input
            label="이름"
            required
            placeholder="홍길동"
            value={form.name}
            error={errors.name}
            onBlur={() => validateField('name')}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="연락처"
            required
            inputMode="numeric"
            placeholder="010-0000-0000"
            value={form.phone}
            error={errors.phone}
            onBlur={() => validateField('phone')}
            onChange={(e) => setForm((f) => ({ ...f, phone: formatPhone(e.target.value) }))}
          />

          <div className="mt-4 flex flex-col gap-3 border-t border-ink-200 pt-6">
            <Checkbox
              checked={allAgreed}
              onChange={(v) => setAgree({ terms: v, privacy: v, marketing: v })}
              label="전체 동의"
              strong
            />
            <div className="h-px bg-ink-200" />
            <Checkbox
              checked={agree.terms}
              onChange={(v) => setAgree((a) => ({ ...a, terms: v }))}
              label="[필수] 이용약관 동의"
            />
            <Checkbox
              checked={agree.privacy}
              onChange={(v) => setAgree((a) => ({ ...a, privacy: v }))}
              label="[필수] 개인정보 수집·이용 동의"
            />
            <Checkbox
              checked={agree.marketing}
              onChange={(v) => setAgree((a) => ({ ...a, marketing: v }))}
              label="[선택] 마케팅 정보 수신 동의"
            />
            {errors.agree && <p className="text-micro text-danger">{errors.agree}</p>}
          </div>

          <Button type="submit" size="xl" fullWidth loading={loading} className="mt-6">
            가입하기
          </Button>
        </form>
      </div>
    </Layout>
  );
}
