import type { CategoryCode, Product, SizeGuideRow } from '@/types';
import { APPAREL_SIZES, COLORS, FREE_SIZE, PLACEHOLDER_TONES } from '@/lib/constants';
import { calcSalePrice } from '@/lib/format';

/** 결정론적 의사난수 — 새로고침해도 동일한 목업이 나오도록 */
function rand(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const TONES = PLACEHOLDER_TONES;

const NAMES: Record<CategoryCode, string[]> = {
  outer: [
    '오버핏 울 블렌드 코트',
    '싱글 브레스티드 트렌치 코트',
    '크롭 무스탕 자켓',
    '오버사이즈 데님 자켓',
    '핸드메이드 발마칸 코트',
    '경량 패딩 베스트',
    '테일러드 울 블레이저',
    '숏 더플 코트',
    '스웨이드 트러커 자켓',
    '벨티드 라이더 자켓',
    '캐시미어 혼방 롱코트',
    '퀼팅 필드 자켓',
  ],
  top: [
    '코튼 오버사이즈 셔츠',
    '케이블 니트 가디건',
    '캐시미어 라운드 니트',
    '스트라이프 저지 티셔츠',
    '실크 터치 블라우스',
    '루즈핏 스웻 셔츠',
    '터틀넥 리브 니트',
    '린넨 반팔 셔츠',
    '크롭 후드 집업',
    '보트넥 슬림 니트',
    '오버핏 데님 셔츠',
    '울 브이넥 베스트',
  ],
  bottom: [
    '하이웨이스트 와이드 슬랙스',
    '스트레이트 데님 팬츠',
    '플리츠 미디 스커트',
    '테이퍼드 울 팬츠',
    '코튼 치노 팬츠',
    '카고 조거 팬츠',
    '롱 데님 스커트',
    '밴딩 와이드 팬츠',
    '슬림 부츠컷 데님',
    '린넨 버뮤다 팬츠',
    '랩 미디 스커트',
    '코듀로이 스트레이트 팬츠',
  ],
  dress: [
    '린넨 셔츠 원피스',
    '니트 슬리브리스 원피스',
    '벨티드 랩 원피스',
    '플리츠 롱 원피스',
    '코튼 셔츠 미니 원피스',
    '슬립 새틴 원피스',
    '터틀넥 니트 원피스',
    '카라 A라인 원피스',
    '데님 점프수트',
    '퍼프소매 미디 원피스',
    '스퀘어넥 롱 원피스',
    '체크 셔츠 원피스',
  ],
  acc: [
    '미니멀 레더 숄더백',
    '스퀘어 크로스백',
    '캐시미어 머플러',
    '레더 벨트',
    '울 페도라',
    '실버 체인 네크리스',
    '데일리 토트백',
    '니트 비니',
    '레더 카드 지갑',
    '메탈 프레임 선글라스',
    '실크 스카프',
    '버클 슬링백',
  ],
};

const CATS: CategoryCode[] = ['outer', 'top', 'bottom', 'dress', 'acc'];

const BASE_PRICE: Record<CategoryCode, number> = {
  outer: 168000,
  top: 58000,
  bottom: 68000,
  dress: 88000,
  acc: 32000,
};

const DESCRIPTION: Record<CategoryCode, string> = {
  outer: '울 혼방 소재의 오버핏 실루엣입니다. 어깨선을 낮춰 편안한 착용감을 만들었고, 안감을 덧대 가을부터 초겨울까지 착용할 수 있습니다.',
  top: '피부에 닿는 감촉이 부드러운 소재로 제작했습니다. 군더더기 없는 라인으로 이너와 아우터 어디에나 어울립니다.',
  bottom: '허리 밴딩 처리로 착용이 편안하며, 떨어지는 실루엣이 다리 라인을 길어 보이게 합니다.',
  dress: '한 벌로 완성되는 미니멀한 원피스입니다. 계절에 따라 이너와 아우터를 더해 오래 활용할 수 있습니다.',
  acc: '데일리로 사용하기 좋은 크기와 무게로 제작했습니다. 과하지 않은 디테일로 어떤 룩에도 자연스럽게 어울립니다.',
};

const APPAREL_GUIDE: SizeGuideRow[] = [
  { label: '어깨너비', values: { S: '43', M: '45', L: '47' } },
  { label: '가슴단면', values: { S: '52', M: '54', L: '56' } },
  { label: '총장', values: { S: '96', M: '98', L: '100' } },
  { label: '소매길이', values: { S: '58', M: '59', L: '60' } },
];

const ACC_GUIDE: SizeGuideRow[] = [
  { label: '가로', values: { FREE: '28' } },
  { label: '세로', values: { FREE: '20' } },
  { label: '무게', values: { FREE: '420g' } },
];

function buildProduct(cat: CategoryCode, idx: number, seq: number): Product {
  const seed = seq + 1;
  const r1 = rand(seed);
  const r2 = rand(seed * 2.3);
  const r3 = rand(seed * 3.7);

  const price = BASE_PRICE[cat] + Math.round((r1 * 60000) / 1000) * 1000;
  const discountRate = r2 > 0.55 ? [10, 20, 30, 40][Math.floor(r3 * 4)] : 0;
  const salePrice = calcSalePrice(price, discountRate);

  const isAcc = cat === 'acc';
  const sizes = isAcc ? FREE_SIZE : APPAREL_SIZES;
  const colorCount = 2 + Math.floor(r1 * 3);
  const colors = COLORS.slice(0, Math.min(colorCount, COLORS.length));

  const stock: Record<string, number> = {};
  colors.forEach((c, ci) => {
    sizes.forEach((s, si) => {
      const k = rand(seed * 7 + ci * 11 + si * 13);
      stock[`${c.code}-${s.code}`] = k > 0.82 ? 0 : 1 + Math.floor(k * 12);
    });
  });
  const soldOut = Object.values(stock).every((v) => v === 0);

  const badges: Product['badges'] = [];
  if (seq % 7 === 0) badges.push('new');
  if (discountRate > 0) badges.push('sale');

  const day = 1 + (seq % 28);
  const month = 8 - (seq % 3);
  const toneIdx = seq % TONES.length;

  return {
    id: `p-${String(seq + 1).padStart(4, '0')}`,
    name: NAMES[cat][idx],
    brand: 'MINIM.',
    category: cat,
    price,
    discountRate,
    salePrice,
    tones: [
      TONES[toneIdx],
      TONES[(toneIdx + 3) % TONES.length],
      TONES[(toneIdx + 5) % TONES.length],
      TONES[(toneIdx + 6) % TONES.length],
    ],
    colors,
    sizes,
    stock,
    soldOut,
    badges,
    salesCount: Math.round(r3 * 900),
    createdAt: `2026-0${month}-${String(day).padStart(2, '0')}T09:00:00.000Z`,
    description: DESCRIPTION[cat],
    sizeGuide: isAcc ? ACC_GUIDE : APPAREL_GUIDE,
  };
}

export const PRODUCTS: Product[] = CATS.flatMap((cat, ci) =>
  NAMES[cat].map((_, idx) => buildProduct(cat, idx, ci * 12 + idx)),
);
