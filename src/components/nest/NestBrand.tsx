import { cn } from '@/lib/nest-utils';

/** A bounded brand lockup: never let the source artwork squeeze navigation. */
export default function NestBrand({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap', className)}>
      <span className="text-2xl font-bold tracking-[-0.06em] leading-none">NEST<span className="text-nest-primary">.</span></span>
      <span aria-hidden="true" className="h-7 w-px bg-current opacity-20" />
      <span className="flex flex-col items-start gap-1">
        <span className="text-[9px] font-medium leading-none tracking-wide opacity-70">by</span>
        {/* Source artwork has transparent padding above and below the wordmark. */}
        <span className="relative block h-[18px] w-[104px] overflow-hidden">
          <img src="/nuloafrica-newlogo-complete.png" alt="Nulo Africa" width={1426} height={673} className="absolute left-0 top-[-14.7px] h-auto w-[104px] max-w-none dark:hidden" />
          <img src="/nuloafrica-newlightlogo-complete.png" alt="Nulo Africa" width={1426} height={673} className="absolute left-0 top-[-14.7px] hidden h-auto w-[104px] max-w-none dark:block" />
        </span>
      </span>
    </span>
  );
}
