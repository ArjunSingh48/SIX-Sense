import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between border-b pb-6 mb-8">
      <div>
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.14em] text-primary font-medium mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
