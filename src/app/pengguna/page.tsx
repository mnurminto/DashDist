import type { Metadata } from "next";
import { HalamanPengguna } from "@/components/dashboard/halaman-pengguna";

export const metadata: Metadata = {
  title: "Daftar Pengguna",
  robots: { index: false },
};

export default function PenggunaPage() {
  return <HalamanPengguna />;
}
