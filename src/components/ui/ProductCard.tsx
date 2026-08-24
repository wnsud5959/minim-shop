import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { comma, cx, toneStyle } from '@/lib/format';

interface PriceLabelProps {
  price: number;
  salePrice: number;
  discountRate: number;
  size?: 'sm' | 'lg';
}

export function PriceLabel({ price, salePrice, discountRate, size = 'sm' }: PriceLabelProps) {
  if (discountRate <= 0) {
    return (
      <div className={cx('font-bold text-ink-900', size === 'lg' ? 'text-price' : 'text-price-sm')}>
        {comma(salePrice)}
        {size === 'lg' && '원'}
      </div>
    );
  }
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={cx('text-ink-400 line-through', size === 'lg' ? 'text-body-sm' : 'text-caption')}>
        {comma(price)}
      </span>
      <span className={cx('font-bold text-ink-600', size === 'lg' ? 'text-body' : 'text-caption')}>
        {discountRate}%
      </span>
      <span className={cx('font-bold text-ink-900', size === 'lg' ? 'text-price' : 'text-price-sm')}>
        {comma(salePrice)}
        {size === 'lg' && '원'}
      </span>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  rank?: number;
  fixedWidth?: number;
}

export default function ProductCard({ product, rank, fixedWidth }: ProductCardProps) {
  const badge = product.badges.includes('new') ? 'NEW' : null;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col gap-2"
      style={fixedWidth ? { width: fixedWidth, flex: '0 0 auto' } : undefined}
    >
      <div className="relative w-full overflow-hidden aspect-product">
        <div
          className="tone h-full w-full transition-transform duration-base ease-standard lg:group-hover:scale-[1.02]"
          style={toneStyle(product.tones[0])}
          role="img"
          aria-label={`${product.name} 대표 이미지`}
        />
        {product.soldOut ? (
          <span className="absolute inset-0 flex items-center justify-center bg-ink-0/[.68] text-micro tracking-[.16em] text-ink-500">
            SOLD OUT
          </span>
        ) : rank ? (
          <span className="absolute left-2.5 top-2.5 flex h-[22px] w-[22px] items-center justify-center bg-ink-900 text-micro text-ink-0">
            {rank}
          </span>
        ) : badge ? (
          <span className="absolute left-2.5 top-2.5 bg-ink-900 px-1.5 py-1 text-micro tracking-[.08em] text-ink-0">
            {badge}
          </span>
        ) : null}
      </div>
      <span className="text-micro text-ink-500">{product.brand}</span>
      <span className="line-clamp-2 text-body-sm text-ink-700">{product.name}</span>
      <PriceLabel
        price={product.price}
        salePrice={product.salePrice}
        discountRate={product.discountRate}
      />
    </Link>
  );
}
