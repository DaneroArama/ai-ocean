import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  CERTIFICATE_DEMO_COOKIE,
  CERTIFICATE_DEMO_PROFILE,
  isDemoSession,
} from "@/lib/certificate-demo-session";
import { PrivateCertificateDemo } from "@/components/attendance/PrivateCertificateDemo";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Private certificate demo",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const authenticated = isDemoSession(
    (await cookies()).get(CERTIFICATE_DEMO_COOKIE)?.value,
  );
  return (
    <PrivateCertificateDemo
      authenticated={authenticated}
      name={CERTIFICATE_DEMO_PROFILE.name}
    />
  );
}
