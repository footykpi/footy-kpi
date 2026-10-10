import { toast } from "sonner";

const SITE = "https://footykpi.com";

/**
 * Canonical public URL for an athlete profile, e.g. https://footykpi.com/p/marcus-chen.
 * Always the live domain — preview/editor origins require a Lovable login, so links
 * and QR codes shared from there would land recipients on a sign-in page.
 */
export function profilePublicUrl(slug: string): string {
  return `${SITE}/p/${slug}`;
}

/**
 * Opens the native share sheet when the device offers one, otherwise copies the
 * link. A dismissed share sheet is left alone — no copy, no toast.
 */
export async function shareProfile({ name, url }: { name: string; url: string }) {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title: `${name} | Footy KPI`, text: name, url });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      // fall through to the clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    toast.success("Profile link copied to clipboard");
  } catch {
    toast.error("Couldn't copy the profile link.");
  }
}
