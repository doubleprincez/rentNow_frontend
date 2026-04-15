import type { Metadata } from "next";
import "@/app/globals.css";



export const metadata: Metadata = {
  title: "Sign Up | RentNow",
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
