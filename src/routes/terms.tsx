import { createFileRoute, Link } from "@tanstack/react-router";
import footyKpiLogo from "@/assets/footy-kpi-logo.png.asset.json";

const DESCRIPTION =
  "Official Footy KPI Terms of Service: rules and conditions for using the Footy KPI platform.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | Footy KPI" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "Terms of Service | Footy KPI" },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

const SECTIONS = [
  {
    id: "acceptance",
    title: "1. ACCEPTANCE OF TERMS",
    content: (
      <>
        <p>
          By accessing or using the Footy KPI mobile application, website, and related services
          (collectively, the “Services”), you agree to be bound by these Terms of Service (“Terms”).
          If you do not agree to these Terms, you may not use the Services.
        </p>
        <p>
          If you are a parent or legal guardian creating or managing an account for a minor athlete,
          you agree to these Terms on behalf of yourself and the minor, and you are responsible for
          the minor’s use of the Services.
        </p>
      </>
    ),
  },
  {
    id: "description",
    title: "2. DESCRIPTION OF SERVICE",
    content: (
      <>
        <p>
          Footy KPI provides tools for youth soccer athletes, parents, guardians, coaches, and
          recruiters to build, manage, share, and discover digital athletic portfolios. Features
          include athlete profiles, season statistics, game logs, highlight uploads, coach
          verification, journal entries, shareable public profiles, and recruiter discovery tools.
        </p>
        <p>
          We may modify, suspend, or discontinue any part of the Services at any time. We will attempt
          to provide notice for material changes when reasonably practicable.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "3. ACCOUNTS AND ELIGIBILITY",
    content: (
      <>
        <p>
          To use many features of the Services, you must create an account and provide accurate,
          current, and complete information. You are responsible for maintaining the security of
          your account credentials and for all activity that occurs under your account.
        </p>
        <ul>
          <li>
            <strong>Age requirements.</strong> Users under 13 may not create an account without
            verifiable parental consent and involvement, as required by law. Accounts for minors must
            be created or supervised by a parent or legal guardian.
          </li>
          <li>
            <strong>Account types.</strong> Athlete, coach, and recruiter accounts each have different
            permissions and dashboards. You may not misrepresent your role or create multiple
            accounts to circumvent restrictions.
          </li>
          <li>
            <strong>Termination.</strong> We may suspend or terminate your account if you violate these
            Terms, abuse the Services, or create risk or legal exposure for Footy KPI.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "user-content",
    title: "4. USER CONTENT AND CONDUCT",
    content: (
      <>
        <p>
          You retain ownership of the content you upload, including photos, videos, stats, awards,
          bio information, and journal entries (“User Content”). By uploading User Content, you grant
          Footy KPI a limited, non-exclusive license to host, display, process, and share that
          content solely to provide the Services.
        </p>
        <p>You agree that you will not upload, share, or promote content that:</p>
        <ul>
          <li>Is unlawful, harmful, threatening, abusive, harassing, defamatory, or obscene.</li>
          <li>Infringes the intellectual property, privacy, or publicity rights of others.</li>
          <li>Contains personal information about another person without appropriate consent.</li>
          <li>Misrepresents athletic achievements, awards, or statistics.</li>
          <li>Contains viruses, malware, or other harmful code.</li>
          <li>Violates any applicable law or regulation.</li>
        </ul>
        <p>
          Parents and guardians are responsible for reviewing and approving any content uploaded by
          a minor athlete in their care.
        </p>
      </>
    ),
  },
  {
    id: "athlete-profiles",
    title: "5. ATHLETE PROFILES AND MINORS",
    content: (
      <>
        <p>
          Athlete profiles may include personal information such as name, photo, birth year, position,
          team, height, weight, graduation year, statistics, and achievements. Parents and guardians
          must carefully review profile visibility settings before allowing any profile information
          to be made public.
        </p>
        <p>
          Footy KPI does not knowingly collect personal information from children under 13 without
          verifiable parental consent. Parents and guardians may review, edit, or request deletion of
          a minor’s personal information by contacting us.
        </p>
      </>
    ),
  },
  {
    id: "coach-verification",
    title: "6. COACH VERIFICATION",
    content: (
      <>
        <p>
          Coaches may be invited by athletes or parents to review and verify certain achievements,
          awards, certificates, and medals. Verification is provided at the coach’s discretion and
          does not constitute an endorsement by Footy KPI.
        </p>
        <p>
          Coaches agree to provide accurate and truthful information when verifying achievements.
          Misuse of the verification feature, including false verifications or harassment of athletes,
          may result in account suspension or termination.
        </p>
      </>
    ),
  },
  {
    id: "public-profiles",
    title: "7. PUBLIC AND PRIVATE PROFILES",
    content: (
      <>
        <p>
          Athletes may choose to keep their portfolio private or make portions of it publicly visible.
          When a profile or specific content is set to public, it may be discoverable by coaches,
          recruiters, family members, and other visitors through a shareable link or search features.
        </p>
        <p>
          You understand that making content public means it may be viewed, shared, or indexed by
          others outside of Footy KPI. Footy KPI is not responsible for how third parties use or
          distribute public profile content once it has been shared.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "8. INTELLECTUAL PROPERTY",
    content: (
      <>
        <p>
          Footy KPI and its licensors own all rights, title, and interest in the Services, including
          software, designs, trademarks, logos, and content provided by Footy KPI (excluding User
          Content). You may not copy, modify, distribute, sell, or lease any part of the Services
          without our prior written consent.
        </p>
        <p>
          The Footy KPI name, logo, and shield mark are trademarks of Footy KPI. You may not use
          these marks without our prior written permission.
        </p>
      </>
    ),
  },
  {
    id: "prohibited-activities",
    title: "9. PROHIBITED ACTIVITIES",
    content: (
      <>
        <p>In connection with the Services, you may not:</p>
        <ul>
          <li>Attempt to access accounts, data, or systems that you are not authorized to access.</li>
          <li>Use automated scripts, bots, scrapers, or similar tools to access or collect data.</li>
          <li>Interfere with or disrupt the integrity or performance of the Services.</li>
          <li>Circumvent security features, rate limits, or access controls.</li>
          <li>Use the Services to send spam, unsolicited messages, or phishing attempts.</li>
          <li>Impersonate another person, athlete, coach, recruiter, or organization.</li>
          <li>Upload content that violates any third-party rights or applicable law.</li>
        </ul>
      </>
    ),
  },
  {
    id: "payments",
    title: "10. PAYMENTS AND SUBSCRIPTIONS",
    content: (
      <>
        <p>
          Footy KPI may offer paid features, subscriptions, or one-time purchases in the future. Any
          payment terms, pricing, and billing cycles will be presented to you before you confirm a
          purchase. All payments are processed by third-party payment processors.
        </p>
        <p>
          Unless otherwise stated, fees are non-refundable except where required by applicable law.
          You are responsible for any taxes associated with your purchase.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    title: "11. TERMINATION",
    content: (
      <>
        <p>
          You may stop using the Services or delete your account at any time by contacting us at{" "}
          <a href="mailto:footykpi@gmail.com" className="text-primary hover:underline">
            footykpi@gmail.com
          </a>
          .
        </p>
        <p>
          We may suspend or terminate your access to the Services at any time, with or without
          notice, for conduct that we believe violates these Terms or is harmful to other users,
          Footy KPI, or third parties.
        </p>
        <p>
          Upon termination, your right to use the Services immediately ceases. Certain provisions
          of these Terms, including ownership, disclaimers, limitation of liability, and
          indemnification, survive termination.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "12. DISCLAIMERS",
    content: (
      <>
        <p>
          THE SERVICES ARE PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTIES OF ANY KIND,
          EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, FOOTY KPI DISCLAIMS ALL
          WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
          PURPOSE, NON-INFRINGEMENT, AND ACCURACY.
        </p>
        <p>
          Footy KPI does not guarantee that the Services will be uninterrupted, secure, error-free, or
          free of viruses or other harmful components. Statistics, ratings, and insights provided
          through the Services are generated from user-submitted data and are not guaranteed to be
          accurate or complete.
        </p>
      </>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "13. LIMITATION OF LIABILITY",
    content: (
      <>
        <p>
          TO THE FULLEST EXTENT PERMITTED BY LAW, FOOTY KPI AND ITS OFFICERS, EMPLOYEES, AGENTS,
          LICENSORS, AND SERVICE PROVIDERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
          SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, GOODWILL,
          OR USE, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICES.
        </p>
        <p>
          OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THESE TERMS OR THE
          SERVICES WILL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO FOOTY KPI FOR THE
          SERVICES IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS
          (US $100).
        </p>
      </>
    ),
  },
  {
    id: "indemnification",
    title: "14. INDEMNIFICATION",
    content: (
      <>
        <p>
          You agree to indemnify, defend, and hold harmless Footy KPI and its officers, employees,
          agents, licensors, and service providers from any claims, liabilities, damages, losses,
          and expenses (including reasonable attorneys’ fees) arising out of or relating to your use
          of the Services, your User Content, your violation of these Terms, or your violation of any
          third-party rights.
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "15. GOVERNING LAW AND DISPUTES",
    content: (
      <>
        <p>
          These Terms are governed by the laws of the State of Arizona, United States, without
          regard to its conflict of laws principles. Any dispute arising out of or relating to these
          Terms or the Services will be resolved exclusively in the state or federal courts located in
          Maricopa County, Arizona.
        </p>
        <p>
          Before filing a claim, you agree to attempt to resolve the dispute informally by contacting
          Footy KPI at{" "}
          <a href="mailto:footykpi@gmail.com" className="text-primary hover:underline">
            footykpi@gmail.com
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "16. CHANGES TO THESE TERMS",
    content: (
      <>
        <p>
          We may update these Terms from time to time. When we make material changes, we will update
          the effective date at the top of the page and may notify you through the app or by email.
          Your continued use of the Services after the updated Terms are posted means you accept the
          changes.
        </p>
      </>
    ),
  },
  {
    id: "contact",
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
        </p>
      </>
    ),
  },
];

function TermsPage() {
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
              <nav aria-label="Terms of service sections" className="mt-4">
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

          {/* Terms body */}
          <article className="max-w-3xl">
            <div className="border-b border-border/60 pb-8">
              <h1 className="font-display text-4xl text-foreground sm:text-5xl">
                Terms of Service
              </h1>
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Effective Date:</strong> September 10, 2026
                </p>
                <p>
                  <strong className="text-foreground">Last Updated:</strong> September 10, 2026
                </p>
              </div>
              <p className="mt-5 text-muted-foreground">
                These Terms of Service (“Terms”) govern your access to and use of the Footy KPI
                mobile application, website, and related services (collectively, the “Services”).
                Please read these Terms carefully before using the Services.
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
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Footy KPI</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
