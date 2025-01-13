import type { Metadata } from "next";
import { Lora, Poppins } from "next/font/google";
import "@/app/globals.css";

const lora = Lora({
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-lora '
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins '
});

export const metadata: Metadata = {
  title: "Sign Up | RentNaija",
  description: 'Online apartment leasing agency',
};

export default function SignUpLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section>{children}</section>
  );
}
