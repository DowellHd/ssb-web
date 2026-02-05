interface BrandNameProps {
  /** When true, displays the trademark symbol (™) */
  first?: boolean;
  /** Optional className for styling */
  className?: string;
}

/**
 * Brand name component for consistent trademark usage.
 * Use `first={true}` only on the first visible mention per page.
 */
export function BrandName({ first = false, className }: BrandNameProps) {
  return (
    <span className={className}>
      Smart Strategies Builder{first && '™'}
    </span>
  );
}

/** Static brand name string with trademark for non-component contexts */
export const BRAND_NAME = 'Smart Strategies Builder';
export const BRAND_NAME_TM = 'Smart Strategies Builder™';
