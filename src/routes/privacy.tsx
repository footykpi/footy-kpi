import { createFileRoute, Link } from "@tanstack/react-router";
import footyKpiLogo from "@/assets/footy-kpi-logo.png.asset.json";

const DESCRIPTION =
  "Official Footy KPI Privacy Policy: how we collect, use, disclose, store, and protect your information.";

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

const SECTIONS = [
  {
    id: "who-may-use",
    title: "1. WHO MAY USE FOOTY KPI",
    content: (
      <>
        <p>
          Footy KPI is designed for youth athletes, parents, guardians, coaches, and authorized
          users. Users under 13 require parental involvement and verifiable consent where required
          by law. Parents and legal guardians may review, correct, or request deletion of their
          child&apos;s personal information at any time.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "2. INFORMATION WE COLLECT",
    content: (
      <>
        <p>We collect the following types of information through the Services:</p>
        <ul>
          <li>
            <strong>A. Account Information.</strong> Name, email address, username, password and
            authentication information, account type, parent or guardian information, date of
            birth/age range, and location.
          </li>
          <li>
            <strong>B. Athlete Profile Information.</strong> Player name, photo, birth year, position,
            jersey number, team or club, dominant foot, height, achievements and awards, bio, and
            graduation year.
          </li>
          <li>
            <strong>C. Sports Performance Information.</strong> Goals, assists, shots, shots on
            goal, minutes played, cards, fouls, saves, games played, match results, performance
            ratings, reflections, and coach notes.
          </li>
          <li>
            <strong>D. Photos and Videos.</strong> Photos, highlight videos, and other media you
            choose to upload. If you are a parent or guardian of a minor, you are responsible for
            any content your child uploads.
          </li>
          <li>
            <strong>E. Verification Information.</strong> Coach verification details and history
            related to awards, certificates, and achievements.
          </li>
          <li>
            <strong>F. Payment Information.</strong> Any payment information is processed by
            third-party payment processors and is not stored directly by Footy KPI.
          </li>
          <li>
            <strong>G. Device and Technical Information.</strong> Device type, operating system, app
            version, IP address, browser or app logs, and other technical data used to maintain and
            secure the Services.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    title: "3. HOW WE USE INFORMATION",
    content: (
      <>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Create, manage, and secure your account.</li>
          <li>Build and display athlete profiles and portfolio showcases.</li>
          <li>Calculate, graph, and present sports performance statistics.</li>
          <li>Enable sharing with coaches, recruiters, family, and other invited users.</li>
          <li>Provide customer support and respond to inquiries.</li>
          <li>Maintain the integrity, security, and performance of the Services.</li>
        </ul>
      </>
    ),
  },
  {
    id: "public-and-private-profiles",
    title: "4. PUBLIC AND PRIVATE PROFILES",
    content: (
      <>
        <p>
          Athletes may choose to keep their portfolio private or make portions of it publicly
          visible. Private profiles are visible only to the athlete, their parent or guardian, and
          users they specifically invite. Public profiles may be discoverable by coaches,
          recruiters, and other visitors through a shareable link.
        </p>
        <p>
          We encourage parents and guardians to carefully review privacy and sharing settings for
          minors before making any profile information public.
        </p>
      </>
    ),
  },
  {
    id: "childrens-privacy",
    title: "5. CHILDREN’S PRIVACY",
    content: (
      <>
        <p>
          Footy KPI complies with the Children&apos;s Online Privacy Protection Act (COPPA) and
          similar laws. We do not knowingly collect personal information from children under 13
          without verifiable parental consent. Parents and legal guardians have the right to review,
          delete, and withdraw consent for the collection of their child&apos;s personal
          information at any time by contacting us.
        </p>
      </>
    ),
  },
  {
    id: "information-sharing",
    title: "6. INFORMATION SHARING",
    content: (
      <>
        <p>We may share information in the following circumstances:</p>
        <ul>
          <li>
            <strong>Service providers.</strong> With trusted vendors who help us operate, host, and
            secure the Services under strict confidentiality obligations.
          </li>
          <li>
            <strong>Public profiles.</strong> Information you choose to make public may be visible to
            visitors, coaches, and recruiters.
          </li>
          <li>
            <strong>Legal compliance.</strong> When required by law, regulation, legal process, or to
            protect the safety, rights, or property of users and others.
          </li>
          <li>
            <strong>Business transfers.</strong> In connection with a merger, acquisition, or sale
            of assets, subject to continued privacy protections.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "we-do-not-sell",
    title: "7. WE DO NOT SELL CHILDREN’S PERSONAL INFORMATION",
    content: (
      <>
        <p>
          Footy KPI does not sell the personal information of children or any user. We do not use
          children&apos;s personal information for behavioral advertising or marketing purposes.
        </p>
      </>
    ),
  },
  {
    id: "advertising",
    title: "8. ADVERTISING",
    content: (
      <>
        <p>
          Footy KPI does not currently display third-party behavioral advertising. If Footy KPI
          introduces advertising in the future, this Privacy Policy will be updated prior to launch.
        </p>
      </>
    ),
  },
  {
    id: "data-security",
    title: "9. DATA SECURITY",
    content: (
      <>
        <p>
          We use reasonable administrative, technical, and physical safeguards to protect your
          information. This includes encrypted cloud storage, private storage buckets with signed
          URLs, authenticated access controls, and role-based permissions. No security system is
          completely impenetrable, and we cannot guarantee absolute security.
        </p>
      </>
    ),
  },
  {
    id: "data-retention",
    title: "10. DATA RETENTION",
    content: (
      <>
        <p>
          We retain personal information for as long as necessary to provide the Services, fulfill
          the purposes described in this Privacy Policy, comply with legal obligations, resolve
          disputes, and enforce our agreements.
        </p>
      </>
    ),
  },
  {
    id: "deleting-an-account",
    title: "11. DELETING AN ACCOUNT",
    content: (
      <>
        <p>
          To delete your account or request removal of personal information, contact us at{" "}
          <a href="mailto:footykpi@gmail.com" className="text-primary hover:underline">
            footykpi@gmail.com
          </a>{" "}
          or{" "}
          <a href="mailto:privacy@footykpi.com" className="text-primary hover:underline">
            privacy@footykpi.com
          </a>
          . We will verify your identity and process the request in accordance with applicable law.
          Some information may remain in backups for a limited time as required for legal or
          operational purposes.
        </p>
      </>
    ),
  },
  {
    id: "your-privacy-rights",
    title: "12. YOUR PRIVACY RIGHTS",
    content: (
      <>
        <p>
          Depending on where you live, you may have rights to access, correct, delete, restrict, or
          object to the processing of your personal information. You may also have the right to
          data portability and to withdraw consent where processing is based on consent. To
          exercise these rights, contact us using the information below.
        </p>
      </>
    ),
  },
  {
    id: "california-privacy-rights",
    title: "13. CALIFORNIA PRIVACY RIGHTS",
    content: (
      <>
        <p>
          California residents may have additional rights under the California Consumer Privacy Act
          (CCPA) and California Privacy Rights Act (CPRA), including the right to know, delete, and
          opt out of the sale or sharing of personal information. Footy KPI does not sell personal
          information. To exercise your California privacy rights, email us at{" "}
          <a href="mailto:privacy@footykpi.com" className="text-primary hover:underline">
            privacy@footykpi.com
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "cookies-and-tracking",
    title: "14. COOKIES AND TRACKING TECHNOLOGIES",
    content: (
      <>
        <p>
          We may use cookies and similar technologies to operate and secure the Services, understand
          usage, and improve performance. You can control cookies through your browser or device
          settings.
        </p>
      </>
    ),
  },
  {
    id: "third-party-services",
    title: "15. THIRD-PARTY SERVICES",
    content: (
      <>
        <p>
          The Services may contain links or integrations to third-party websites or services. This
          Privacy Policy does not apply to those third parties. We encourage you to review the
          privacy policies of any third-party service you use.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "16. CHANGES TO THIS PRIVACY POLICY",
    content: (
      <>
        <p>
          We may update this Privacy Policy from time to time. When we make material changes, we
          will update the effective date at the top of the page and may notify you through the app
          or by email. Your continued use of the Services after the updated Privacy Policy is posted
          means you accept the changes.
        </p>
      </>
    ),
  },
  {
    id: "contact-us",
    title: "17. CONTACT US",
    content: (
      <>
        <p>
          <strong>Footy KPI</strong>
          <br />
          Gilbert, AZ
          <br />
          Email:{" "}
          <a href="mailto:footykpi@gmail.com" className="text-primary hover:underline">
            footykpi@gmail.com
          </a>
          <br />
          Parent/Guardian Privacy Requests:{" "}
          <a href="mailto:footykpi@gmail.com" className="text-primary hover:underline">
            footykpi@gmail.com
          </a>
        </p>
      </>
    ),
  },
];

function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/50 bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
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

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          {/* Table of contents */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-lg text-foreground">Contents</h2>
              <nav aria-label="Privacy policy sections" className="mt-4">
                <ol className="space-y-2 text-sm">
                  {SECTIONS.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="block text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </aside>

          {/* Policy body */}
          <article className="max-w-3xl">
            <div className="border-b border-border/60 pb-8">
              <h1 className="font-display text-4xl text-foreground sm:text-5xl">Privacy Policy</h1>
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Effective Date:</strong> September 10, 2026
                </p>
                <p>
                  <strong className="text-foreground">Last Updated:</strong> September 10, 2026
                </p>
              </div>
              <p className="mt-5 text-muted-foreground">
                Footy KPI (“Footy KPI,” “we,” “us,” or “our”) respects your privacy and is committed
                to protecting the personal information of our users, including youth athletes and
                their parents or legal guardians. This Privacy Policy explains how we collect, use,
                disclose, store, and protect information when you use the Footy KPI mobile
                application, website, and related services (collectively, the “Services”).
              </p>
              <p className="mt-3 text-muted-foreground">
                By using the Services, you acknowledge that you have read this Privacy Policy. If
                you are a parent or legal guardian creating or managing an account for a minor, you
                are responsible for reviewing this Privacy Policy and providing any consent required
                by applicable law.
              </p>
            </div>

            <div className="mt-10 space-y-12">
              {SECTIONS.map((section) => (
                <section key={section.id} id={section.id}>
                  <h2 className="font-display text-2xl text-foreground">{section.title}</h2>
                  <div className="prose prose-invert mt-4 max-w-none text-muted-foreground">
                    {section.content}
                  </div>
                </section>
              ))}
            </div>
          </article>
        </div>
      </main>

      <footer className="border-t border-border/50 bg-surface py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Footy KPI
          </p>
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
