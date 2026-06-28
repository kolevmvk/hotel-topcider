import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PrivateAnalyticsPanel from "@/components/PrivateAnalyticsPanel";
import { ACCESS_COOKIE_NAME } from "@/lib/access/constants";
import { verifyAccessSessionToken } from "@/lib/access/session";
import { isAnalyticsViewer } from "@/lib/analytics/viewer";

export const metadata = {
  title: "Interna analitika",
  robots: { index: false, follow: false },
};

export default async function InternoAnalitikaPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const session = await verifyAccessSessionToken(token);

  if (!session.valid || !isAnalyticsViewer(session.username)) {
    redirect("/access");
  }

  return (
    <div data-track-no-auto>
      <PrivateAnalyticsPanel />
    </div>
  );
}
