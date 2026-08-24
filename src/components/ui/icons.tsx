interface IconProps {
  size?: number;
  className?: string;
}

const base = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
  'aria-hidden': true,
});

export const MenuIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M3 7h18M3 12h18M3 17h18" />
  </svg>
);

export const SearchIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.6-3.6" />
  </svg>
);

export const CartIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M3 4h2.2l2.3 10.4a2 2 0 0 0 2 1.6h7.1a2 2 0 0 0 2-1.6L20 8H6.2" />
    <circle cx="10" cy="20" r="1.2" />
    <circle cx="17" cy="20" r="1.2" />
  </svg>
);

export const UserIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </svg>
);

export const BackIcon = ({ size = 20, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

export const ChevronRightIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export const ChevronDownIcon = ({ size = 16, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M5 9l7 7 7-7" />
  </svg>
);

export const CloseIcon = ({ size = 18, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const CheckIcon = ({ size = 12, className }: IconProps) => (
  <svg {...base(size, className)} strokeWidth={3}>
    <path d="M4 12.5l5.5 5.5L20 7" />
  </svg>
);

export const MinusIcon = ({ size = 14, className }: IconProps) => (
  <svg {...base(size, className)} strokeWidth={1.6}>
    <path d="M5 12h14" />
  </svg>
);

export const PlusIcon = ({ size = 14, className }: IconProps) => (
  <svg {...base(size, className)} strokeWidth={1.6}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const EyeIcon = ({ size = 18, className }: IconProps) => (
  <svg {...base(size, className)}>
    <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" />
    <circle cx="12" cy="12" r="2.6" />
  </svg>
);

export const BagIcon = ({ size = 44, className }: IconProps) => (
  <svg {...base(size, className)} strokeWidth={1.1}>
    <path d="M5 7h14l-1.2 12.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8Z" />
    <path d="M9 7V5.6A3 3 0 0 1 15 5.6V7" />
  </svg>
);

export const SearchEmptyIcon = ({ size = 44, className }: IconProps) => (
  <svg {...base(size, className)} strokeWidth={1.1}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4M8.5 11h5" />
  </svg>
);
