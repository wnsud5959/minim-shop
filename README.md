# MINIM. — 반응형 패션 쇼핑몰 (Frontend)

와이어프레임 v1.0 + 디자인 토큰 v1.0 기준 1차 구현.

## 실행

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 타입체크 + 프로덕션 빌드
npm run typecheck  # 타입만 검사
```

> 이 저장소는 소스만 포함합니다. `node_modules`는 `npm install`로 생성하세요.

## 배포 (GitHub Pages)

`main` 브랜치에 push하면 GitHub Actions가 빌드해 Pages로 배포합니다.

```
.github/workflows/deploy.yml   # npm ci → typecheck → build → deploy
```

### 최초 1회 설정
1. GitHub에 저장소 생성 후 push
2. 저장소 **Settings → Pages → Source** 를 **GitHub Actions** 로 변경
3. Actions 탭에서 첫 배포 완료 확인 → `https://<계정>.github.io/<저장소명>/`

### 경로 처리
- 프로젝트 페이지는 `/<저장소명>/` 하위에 배포되므로 CI에서 `BASE_PATH`를 주입하고,
  라우터 `basename`은 `import.meta.env.BASE_URL`을 사용합니다
- GitHub Pages는 history fallback이 없어 `dist/404.html`을 `index.html` 사본으로 둡니다
  (`/products/p-0001` 직접 접근·새로고침 대응)

## 기술 스택

| 항목 | 선택 |
|------|------|
| 빌드 | Vite 5 |
| 프레임워크 | React 18 + TypeScript |
| 스타일 | Tailwind CSS 3 (디자인 토큰 반영) |
| 라우팅 | react-router-dom v6 |
| 상태 | Zustand (cart / auth / ui) |
| 데이터 | Mock JSON + API 레이어 분리 |

## 폴더 구조

```
src/
├─ api/          # Mock API — 실 API 전환 시 이 폴더만 교체
│  ├─ products.ts
│  └─ auth.ts
├─ components/
│  ├─ layout/    # Header, Drawer, Footer, Layout
│  └─ ui/        # Button, Field, Controls, ProductCard, Feedback, icons
├─ lib/          # constants(정책값), format(금액·검증 유틸)
├─ mock/         # products.ts — 결정론적 목업 60건
├─ pages/        # 8개 라우트 화면
├─ store/        # cartStore, authStore, uiStore
├─ types.ts
└─ index.css     # Tailwind + 톤 플레이스홀더 유틸
```

## 라우트

| 경로 | 화면 | 비고 |
|------|------|------|
| `/` | 메인 | 히어로·카테고리·신상품·베스트 |
| `/products` | 상품 리스트 | 필터·정렬 전부 쿼리스트링 동기화 |
| `/products/:id` | 상품 상세 | 옵션 선택 → 장바구니 / 바로구매 |
| `/cart` | 장바구니 | localStorage 유지 |
| `/order` | 주문서 | 주문 데이터 없으면 `/cart`로 리다이렉트 |
| `/login`, `/signup` | 인증 | Mock 로그인 |
| `*` | 404 | |

## 구현된 정책

- 배송비: 50,000원 이상 무료 / 미만 3,000원
- 옵션: 컬러 → 사이즈 순차 선택, 재고 0 사이즈 비활성 + 취소선
- 동일 옵션 재선택 시 신규 행 추가 없이 수량 +1 (최대 10)
- 장바구니 품절 항목 상단 고정 + 선택 불가, 주문 시 자동 제외
- 필터·정렬 조건 URL 반영 → 새로고침·뒤로가기로 복원
- 폼 검증: 주문서는 제출 시 일괄, 회원가입은 blur + 제출 시 재검증

## 테스트 계정

- 이메일: 아무 값 / 비밀번호: `minim1234`
- 중복 이메일 시나리오: `test@test.com`

## 이미지 자산

실촬영 전이라 상품 이미지는 `tone` 클래스(그라디언트 플레이스홀더)로 대체했습니다.
`Product.tones` → `<img>` 로 교체하면 됩니다. 비율(3:4)은 이미 고정되어 있습니다.

## 1차 제외 범위

실 결제(PG), 관리자, 리뷰, 마이페이지, 소셜 로그인 실연동, 주소 검색 API
