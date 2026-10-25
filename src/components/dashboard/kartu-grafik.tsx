import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "cn";

type Props = {
  judul: string;
  keterangan?: string;
  aksi?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Kartu pembungkus grafik: judul, keterangan, dan area grafik. */
export function KartuGrafik({
  judul,
  keterangan,
  aksi,
  children,
  className,
}: Props) {
  return (
    <Card
      className={cn(
        "gap-3 overflow-hidden rounded-2xl border-border bg-card/60 py-0",
        className,
      )}
    >
      <CardHeader className="gap-1 border-b border-border/60 py-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-medium tracking-tight">
              {judul}
            </CardTitle>
            {keterangan && (
              <CardDescription className="mt-1 text-xs">
                {keterangan}
              </CardDescription>
            )}
          </div>
          {aksi}
        </div>
      </CardHeader>
      <CardContent className="pb-5">{children}</CardContent>
    </Card>
  );
}
