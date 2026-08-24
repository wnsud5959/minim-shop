import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * 렌더 중 예외가 전체 화면을 흰 화면으로 만들지 않도록 하는 최상위 경계.
 * 손상된 저장 데이터로 인한 예외는 저장소 초기화로 복구할 수 있게 안내한다.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('[MINIM] render error', error, info.componentStack);
    }
  }

  private reset = () => {
    try {
      window.localStorage.removeItem('minim-cart');
      window.sessionStorage.removeItem('minim-cart');
    } catch {
      /* noop */
    }
    window.location.href = import.meta.env.BASE_URL;
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="flex w-full max-w-[400px] flex-col items-center gap-4 text-center">
          <p className="text-brand text-ink-900">MINIM.</p>
          <h1 className="text-h1 text-ink-900">일시적인 오류입니다</h1>
          <p className="text-body-sm text-ink-500">
            화면을 불러오는 중 문제가 발생했습니다.
            <br />
            새로고침해도 반복되면 저장된 장바구니 정보를 초기화해 주세요.
          </p>
          <div className="mt-2 flex w-full gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="h-touch flex-1 border border-ink-300 text-body-sm text-ink-800"
            >
              새로고침
            </button>
            <button
              type="button"
              onClick={this.reset}
              className="h-touch flex-1 bg-ink-800 text-body-sm font-medium text-ink-0"
            >
              초기화 후 홈으로
            </button>
          </div>
        </div>
      </div>
    );
  }
}
