import { notFound } from "next/navigation";
import { ParticipantAttendance } from "@/components/attendance/ParticipantAttendance";
export default function Page() {
  if (
    process.env.NODE_ENV !== "development" ||
    !/^http:\/\/(localhost|127\.0\.0\.1):/.test(
      process.env.NEXT_PUBLIC_CONVEX_URL || "",
    )
  )
    notFound();
  return <ParticipantAttendance demo />;
}
