export default function Footer() {
  return (
    <footer className="mt-16 border-t border-ink-200 bg-ink-50 lg:mt-20">
      <div className="container-page py-10 lg:py-12">
        <div className="flex flex-col gap-2.5 lg:hidden">
          <span className="text-brand text-ink-600">MINIM.</span>
          <p className="text-micro leading-relaxed text-ink-500">
            브랜드 소개 · 이용약관 · 개인정보처리방침
            <br />
            고객센터 1600-0000 (평일 10:00–18:00)
          </p>
          <p className="mt-1.5 text-micro text-ink-500">© 2026 MINIM.</p>
        </div>

        <div className="hidden lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-10">
          <div className="flex flex-col gap-3">
            <span className="text-brand-lg text-ink-600">MINIM.</span>
            <p className="text-caption leading-relaxed text-ink-500">
              일상에 필요한 최소한의 옷.
              <br />
              2026 AUTUMN COLLECTION
            </p>
          </div>
          {[
            { head: '고객센터', rows: ['1600-0000', '평일 10:00–18:00', '주말·공휴일 휴무'] },
            { head: '정책', rows: ['이용약관', '개인정보처리방침', '교환·반품 안내'] },
            { head: 'SNS', rows: ['Instagram', 'Pinterest', 'Newsletter'] },
          ].map((col) => (
            <div key={col.head} className="flex flex-col gap-2.5">
              <span className="text-caption font-medium text-ink-700">{col.head}</span>
              {col.rows.map((r) => (
                <span key={r} className="text-caption text-ink-500">
                  {r}
                </span>
              ))}
            </div>
          ))}
        </div>

        <p className="mt-10 hidden text-micro text-ink-500 lg:block">
          © 2026 MINIM. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
