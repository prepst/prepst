import { cn } from "@/lib/utils";

export function ThemeIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block shrink-0 bg-current", className)}
      style={{
        maskImage: `url(/icons/${name}.png)`,
        WebkitMaskImage: `url(/icons/${name}.png)`,
        maskRepeat: "no-repeat",
        maskPosition: "center",
        maskSize: "contain",
      }}
    />
  );
}
