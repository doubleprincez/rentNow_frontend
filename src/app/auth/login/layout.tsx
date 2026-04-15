import type { Metadata } from "next";
import "@/app/globals.css";



export const metadata: Metadata = {
  title: "Log In | RentNow",
  description: 'Online apartment leasing agency',
};

export default function LogInLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section>{children}</section>
  );
}
