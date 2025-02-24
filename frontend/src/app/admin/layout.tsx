import Protaction from "@/components/auth/Redisautofill";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Protaction>{children}</Protaction>;
}
