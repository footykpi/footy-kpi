import { createFileRoute, Link } from "@tanstack/react-router";
import footyKpiLogo from "@/assets/footy-kpi-logo.png.asset.json";

const DESCRIPTION =
  "Footy KPI privacy policy: what we collect, how we use it, how sharing and visibility work, and how to request data removal.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Footy KPI" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Privacy Policy | Footy KPI" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/50 bg-surface">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={footyKpiLogo.url}
              alt="Footy KPI shield"
              className="h-10 w-10 rounded-lg object-cover"
            />
            <span className="font-display text-2xl tracking-wide text-foreground">FOOTY KPI</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <article className="prose prose-invert max-w-none">
          <h1 className="font-display text-4xl text-foreground">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: September 16, 2026</p>

          <section className="mt-8">
            <h2 className="font-display text-2xl text-foreground">1. Information we collect</h2>
            <p className="mt-3 text-muted-foreground">
              Footy KPI collects the information you provide when creating and using your account and
              portfolio:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <strong className="text-foreground">Account details:</strong> email address,
                password, full name, and the role you select (athlete, coach, or recruiter).
              </li>
              <li>
                <strong className="text-foreground">Athlete profile information:</strong> player
                photo, team name, jersey number, position, graduation year, height, weight,
                dominant foot, GPA (optional), and bio.
              </li>
              <li>
                <strong className="text-foreground">Match statistics:</strong> goals, assists,
                shots, minutes played, cards, saves, clean sheets, and other soccer stats you enter
                per game or season.
              </li>
              <li>
                <strong className="text-foreground">Media uploads:</strong> photos, highlight
                videos, awards, certificates, and medals you choose to upload.
              </li>
              <li>
                <strong className="text-foreground">Journal entries:</strong> post-game
                reflections, mood selections, and performance ratings.
              </li>
              <li>
                <strong className="text-foreground">Usage data:</strong> browser type, device
                information, and log data used to keep the service secure and reliable.
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-2xl text-foreground">2. How we use your information</h2>
            <p className="mt-3 text-muted-foreground">We use your information to:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Build and display your digital football portfolio.</li>
              <li>Let coaches review and verify the achievements you invite them to check.</li>
              <li>Enable recruiters and college coaches to discover public player profiles.</li>
              <li>Generate progress charts, insights, and season summaries.</li>
              <li>Maintain account security, respond to support requests, and improve the app.</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-2xl text-foreground">3. Data sharing and visibility</h2>
            <p className="mt-3 text-muted-foreground">
              You control how much of your portfolio is visible:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <strong className="text-foreground">Private profiles:</strong> only you and anyone
                you specifically invite can view your full dashboard.
              </li>
              <li>
                <strong className="text-foreground">Public profiles:</strong> when you set your
                portfolio to public, visitors with your share link can see the profile details,
                bio, season stats, highlights, and game log you choose to display.
              </li>
              <li>
                <strong className="text-foreground">Coach invites:</strong> inviting a coach lets
                them review and verify your awards and certificates. Coaches cannot edit your
                profile unless you explicitly invite them.
              </li>
              <li>
                <strong className="text-foreground">Unlock links:</strong> you can generate links
                that reveal extra details to specific recruiters or coaches without making the
                entire profile public.
              </li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-2xl text-foreground">4. Storage and security</h2>
            <p className="mt-3 text-muted-foreground">
              Footy KPI stores data through encrypted, industry-standard cloud services. Uploaded
              photos and videos are kept in private storage buckets and served through signed,
              time-limited URLs. We use row-level security, authenticated access checks, and
              role-based permissions to help protect your information.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-2xl text-foreground">5. Your choices</h2>
            <p className="mt-3 text-muted-foreground">You can:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
              <li>Edit or delete profile information, stats, games, and media from your dashboard.</li>
              <li>Switch your portfolio between private and public visibility at any time.</li>
              <li>Revoke coach invites and disable unlock links.</li>
              <li>Request a full export or deletion of your account data.</li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-2xl text-foreground">
              6. Account deletion and data removal
            </h2>
            <p className="mt-3 text-muted-foreground">
              To delete your account and remove your data, email us at{" "}
              <a
                href="mailto:support@footykpi.com"
                className="text-primary underline underline-offset-2"
              >
                support@footykpi.com
              </a>
              . We will confirm your identity and process the deletion within 30 days. Some
              information may be retained in backups for a limited period as required by law.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-2xl text-foreground">7. Children's privacy</h2>
            <p className="mt-3 text-muted-foreground">
              Footy KPI is designed for youth athletes. We encourage parents or guardians to
              supervise account creation and profile sharing. If you believe a child has provided
              information without appropriate consent, contact us and we will delete it.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-2xl text-foreground">8. Changes to this policy</h2>
            <p className="mt-3 text-muted-foreground">
              We may update this Privacy Policy from time to time. When we do, we will revise the
              "Last updated" date at the top of the page and notify you of material changes through
              the app or by email.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="font-display text-2xl text-foreground">9. Contact us</h2>
            <p className="mt-3 text-muted-foreground">
              Questions or concerns about privacy? Reach out to{" "}
              <a
                href="mailto:support@footykpi.com"
                className="text-primary underline underline-offset-2"
              >
                support@footykpi.com
              </a>
              .
            </p>
          </section>
        </article>
      </main>

      <footer className="border-t border-border/50 bg-surface py-6">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-6">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Footy KPI</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
