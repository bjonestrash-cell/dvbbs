import { redirect } from "next/navigation";

/**
 * Legacy /more route. The bottom-tab nav has been removed in favor of a
 * unified sidebar drawer. Sending visitors back to /tour. Keep the file so
 * existing bookmarks don't 404.
 */
export default function MorePage() {
  redirect("/tour");
}
