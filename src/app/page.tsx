import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect to post-auth which handles login check and profile completion
  redirect("/post-auth?callbackUrl=%2Fdashboard");
}
