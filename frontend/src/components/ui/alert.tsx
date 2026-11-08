import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Tone = "info" | "success" | "warning" | "danger";

const tones: Record<Tone, { wrapper: string; icon: string }> = {
  info: { wrapper: "border-indigo-200 bg-indigo-50 text-indigo-900", icon: "text-indigo-600" },
  success: {
    wrapper: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: "text-emerald-600",
  },
  warning: { wrapper: "border-amber-200 bg-amber-50 text-amber-900", icon: "text-amber-600" },
  danger: { wrapper: "border-rose-200 bg-rose-50 text-rose-900", icon: "text-rose-600" },
};

export function Alert({
  tone = "info",
  title,
  children,
  role = "status",
  className,
}: {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  role?: "status" | "alert";
  className?: string;
}) {
  const styles = tones[tone];

  return (
    <div
      role={role}
      aria-live={role === "alert" ? "assertive" : "polite"}
      className={cn("flex gap-3 rounded-xl border px-4 py-3 text-sm", styles.wrapper, className)}
    >
      <span aria-hidden="true" className={cn("mt-0.5 font-bold", styles.icon)}>
        {tone === "success" ? "\u2713" : tone === "danger" ? "!" : "i"}
      </span>
      <div className="space-y-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className="text-sm/6 opacity-90">{children}</div> : null}
      </div>
    </div>
  );
}
