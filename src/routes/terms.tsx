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
    id: "about-footy-kpi",
    title: "1. ABOUT FOOTY KPI",
    content: (
      <>
        <p>
          Footy KPI is a sports performance tracking platform designed to help athletes, parents,
          coaches, and authorized users record, organize, track, and share soccer statistics and
          athletic achievements.
        </p>
        <p>
          Footy KPI is a technology platform. Footy KPI does not provide professional coaching,
          medical advice, recruiting guarantees, scholarship guarantees, or professional scouting
          services unless expressly stated otherwise.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    title: "2. ELIGIBILITY",
    content: (
      <>
        <p>You must provide accurate information when creating an account.</p>
        <p>
          If you are under the age of 18, you must have the permission and involvement of your
          parent or legal guardian where required.
        </p>
        <p>
          Users under 13 may only use Footy KPI through an account or process authorized by a parent
          or legal guardian and subject to applicable children’s privacy laws.
        </p>
        <p>Parents and legal guardians are responsible for supervising a minor’s use of the Services.</p>
      </>
    ),
  },
  {
    id: "parent-and-guardian-accounts",
    title: "3. PARENT AND GUARDIAN ACCOUNTS",
    content: (
      <>
        <p>
          A parent or legal guardian may create and manage an account for a minor athlete. By creating
          an account for a minor, you represent that:
        </p>
        <ul>
          <li>
            You are the child’s parent or legal guardian, or are otherwise authorized to act on the
            child’s behalf;
          </li>
          <li>You have authority to provide any required consent;</li>
          <li>The information you provide is accurate; and</li>
          <li>
            You understand how the athlete’s information may be displayed based on the profile’s
            privacy settings.
          </li>
        </ul>
        <p>
          Parents and guardians are responsible for reviewing and managing the athlete’s profile and
          privacy settings.
        </p>
      </>
    ),
  },
  {
    id: "athlete-profiles",
    title: "4. ATHLETE PROFILES",
    content: (
      <>
        <p>
          Users may create athlete profiles containing information such as statistics, achievements,
          photographs, videos, team information, and other permitted content.
        </p>
        <p>Users are responsible for the accuracy and appropriateness of information they add.</p>
        <p>You agree not to create a profile for another person without appropriate authorization.</p>
      </>
    ),
  },
  {
    id: "public-and-private-profiles",
    title: "5. PUBLIC AND PRIVATE PROFILES",
    content: (
      <>
        <p>Footy KPI may allow users to designate profiles as public or private.</p>
        <p>
          You understand that information intentionally placed in a public profile may be accessible
          to people outside your immediate team or family.
        </p>
        <p>
          For minors, we strongly encourage parents and guardians to review public-profile settings
          carefully.
        </p>
        <p>
          Footy KPI does not guarantee that information shared publicly can be completely removed
          from the internet after publication.
        </p>
      </>
    ),
  },
  {
    id: "user-content",
    title: "6. USER CONTENT",
    content: (
      <>
        <p>
          “User Content” means information, statistics, photographs, videos, comments, biographies,
          achievements, or other materials submitted to Footy KPI.
        </p>
        <p>You retain ownership of your User Content.</p>
        <p>
          By submitting User Content, you grant Footy KPI a limited, non-exclusive, worldwide,
          royalty-free license to host, store, reproduce, process, display, and transmit that content
          solely as reasonably necessary to provide, operate, maintain, and improve the Services.
        </p>
        <p>
          If you make content public, you authorize Footy KPI to display that content according to
          your selected privacy settings.
        </p>
        <p>
          You represent that you have the rights and permissions necessary to submit the User
          Content.
        </p>
      </>
    ),
  },
  {
    id: "photographs-and-videos-of-minors",
    title: "7. PHOTOGRAPHS AND VIDEOS OF MINORS",
    content: (
      <>
        <p>
          Users must not upload photographs or videos of another person, including another minor,
          without appropriate permission or authorization.
        </p>
        <p>
          Parents and guardians are responsible for determining whether photographs and videos
          involving their children may be uploaded or shared.
        </p>
        <p>
          Footy KPI may remove content that we reasonably believe violates these Terms, privacy
          rights, applicable law, or the safety of users.
        </p>
      </>
    ),
  },
  {
    id: "accuracy-of-statistics",
    title: "8. ACCURACY OF STATISTICS",
    content: (
      <>
        <p>
          Footy KPI allows users to enter and track sports statistics. Unless specifically identified
          as verified, statistics are user-submitted and may not have been independently confirmed.
        </p>
        <p>
          A “Verified” statistic means that the applicable verification process has been completed
          according to Footy KPI’s verification system.
        </p>
        <p>
          Verification does not guarantee that a statistic is objectively correct or that it will be
          accepted by a league, school, club, college, recruiter, governing body, or other
          organization.
        </p>
        <p>
          Footy KPI may correct, remove, or investigate statistics that appear fraudulent,
          inaccurate, manipulated, or improperly verified.
        </p>
      </>
    ),
  },
  {
    id: "verification",
    title: "9. VERIFICATION",
    content: (
      <>
        <p>
          Premium or other eligible users may request verification of certain statistics.
          Verification may require confirmation by a coach, team administrator, league
          representative, scorekeeper, or other authorized individual.
        </p>
        <p>Footy KPI reserves the right to:</p>
        <ul>
          <li>Approve verification</li>
          <li>Reject verification</li>
          <li>Request additional information</li>
          <li>Remove verification</li>
          <li>Suspend verification privileges</li>
        </ul>
        <p>
          Users must not impersonate coaches, team administrators, leagues, or other authorized
          individuals.
        </p>
      </>
    ),
  },
  {
    id: "prohibited-conduct",
    title: "10. PROHIBITED CONDUCT",
    content: (
      <>
        <p>You may not:</p>
        <ul>
          <li>Provide false information</li>
          <li>Impersonate another person</li>
          <li>Create unauthorized profiles</li>
          <li>Falsify statistics</li>
          <li>Manipulate verification</li>
          <li>Upload content you do not have permission to use</li>
          <li>Upload unlawful, abusive, threatening, or harmful content</li>
          <li>Harass or target another user</li>
          <li>Attempt to access another user’s account</li>
          <li>Attempt to bypass security measures</li>
          <li>Reverse engineer the Services</li>
          <li>Copy or reproduce Footy KPI’s software or design without authorization</li>
          <li>Use the Services to violate applicable laws</li>
          <li>Use the Services to exploit, harm, or endanger minors</li>
          <li>Collect personal information about other users without authorization</li>
          <li>Use automated systems to scrape the Services without permission</li>
        </ul>
      </>
    ),
  },
  {
    id: "subscriptions",
    title: "11. SUBSCRIPTIONS",
    content: (
      <>
        <p>Footy KPI may offer free and paid subscription plans.</p>
        <p>
          Paid plans may provide additional features such as enhanced statistics, verified
          statistics, advanced analytics, additional storage, recruiting profiles, or other premium
          functionality.
        </p>
        <p>Subscription pricing and features will be disclosed at the time of purchase.</p>
      </>
    ),
  },
  {
    id: "automatic-renewal",
    title: "12. AUTOMATIC RENEWAL",
    content: (
      <>
        <p>
          Unless otherwise stated, paid subscriptions may automatically renew at the end of each
          billing period.
        </p>
        <p>
          By purchasing a subscription, you authorize the applicable payment provider or app store
          to charge the applicable subscription fee.
        </p>
        <p>
          You may cancel your subscription according to the cancellation process provided by Footy
          KPI or the applicable app store.
        </p>
      </>
    ),
  },
  {
    id: "refunds",
    title: "13. REFUNDS",
    content: (
      <>
        <p>
          Payments and refunds may be governed by the policies of the applicable app store or
          payment processor.
        </p>
        <p>
          Unless otherwise required by law, subscription fees are non-refundable after the applicable
          billing period begins.
        </p>
        <p>
          Nothing in these Terms limits any mandatory refund rights provided by applicable law.
        </p>
      </>
    ),
  },
  {
    id: "free-features",
    title: "14. FREE FEATURES",
    content: (
      <>
        <p>Footy KPI may offer certain Services at no cost.</p>
        <p>
          We may modify, discontinue, or limit free features at any time, subject to applicable law.
        </p>
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "15. INTELLECTUAL PROPERTY",
    content: (
      <>
        <p>
          The Footy KPI Services, including the software, design, trademarks, logos, graphics,
          interfaces, text, functionality, and other original materials, are owned by or licensed to
          Footy KPI and are protected by applicable intellectual property laws.
        </p>
        <p>
          Except as expressly permitted by these Terms, you may not copy, reproduce, modify,
          distribute, sell, license, reverse engineer, or create derivative works from the Services.
        </p>
        <p>
          “Footy KPI” and associated logos and branding are trademarks or proposed trademarks of
          Footy KPI or its owner.
        </p>
      </>
    ),
  },
  {
    id: "feedback",
    title: "16. FEEDBACK",
    content: (
      <>
        <p>
          If you submit suggestions, ideas, recommendations, or feedback regarding Footy KPI, you
          agree that we may use that feedback without compensation or obligation to you, provided
          that doing so does not disclose your confidential information or violate applicable law.
        </p>
      </>
    ),
  },
  {
    id: "third-party-services",
    title: "17. THIRD-PARTY SERVICES",
    content: (
      <>
        <p>The Services may integrate with third-party services.</p>
        <p>
          Footy KPI is not responsible for third-party services, websites, payment processors,
          hosting providers, app stores, or other external services.
        </p>
        <p>
          Your use of third-party services may be subject to separate terms and privacy policies.
        </p>
      </>
    ),
  },
  {
    id: "app-store-terms",
    title: "18. APP STORE TERMS",
    content: (
      <>
        <p>
          If you download Footy KPI through Apple’s App Store or Google Play, additional terms
          imposed by the applicable platform may apply.
        </p>
        <p>Your use of the application must comply with applicable app-store rules.</p>
      </>
    ),
  },
  {
    id: "no-guarantee-of-results",
    title: "19. NO GUARANTEE OF ATHLETIC OR RECRUITING RESULTS",
    content: (
      <>
        <p>Footy KPI does not guarantee:</p>
        <ul>
          <li>Athletic improvement</li>
          <li>Team selection</li>
          <li>Starting position</li>
          <li>Tournament selection</li>
          <li>College recruitment</li>
          <li>Scholarships</li>
          <li>Professional opportunities</li>
          <li>NIL opportunities</li>
          <li>Scout interest</li>
          <li>Recruiting success</li>
        </ul>
        <p>
          Statistics and profiles are intended to help athletes organize and present their athletic
          history.
        </p>
      </>
    ),
  },
  {
    id: "no-medical-advice",
    title: "20. NO MEDICAL ADVICE",
    content: (
      <>
        <p>Footy KPI is not a medical provider.</p>
        <p>
          Information within the Services should not be considered medical advice, diagnosis,
          treatment, or a substitute for consultation with a qualified healthcare professional.
        </p>
      </>
    ),
  },
  {
    id: "service-availability",
    title: "21. SERVICE AVAILABILITY",
    content: (
      <>
        <p>
          We will make reasonable efforts to keep Footy KPI available, but we do not guarantee
          uninterrupted or error-free operation.
        </p>
        <p>The Services may occasionally be unavailable because of:</p>
        <ul>
          <li>Maintenance</li>
          <li>Updates</li>
          <li>Technical problems</li>
          <li>Security incidents</li>
          <li>Third-party service interruptions</li>
          <li>Internet or telecommunications failures</li>
          <li>Circumstances outside our reasonable control</li>
        </ul>
      </>
    ),
  },
  {
    id: "account-suspension-or-termination",
    title: "22. ACCOUNT SUSPENSION OR TERMINATION",
    content: (
      <>
        <p>
          We may suspend or terminate an account if we reasonably believe that the user:
        </p>
        <ul>
          <li>Violated these Terms</li>
          <li>Violated applicable law</li>
          <li>Provided fraudulent information</li>
          <li>Manipulated statistics or verification</li>
          <li>Created a safety or security risk</li>
          <li>Misused the Services</li>
          <li>Engaged in conduct harmful to another user</li>
        </ul>
        <p>Parents or guardians may request deletion of a minor’s account.</p>
      </>
    ),
  },
  {
    id: "user-safety",
    title: "23. USER SAFETY",
    content: (
      <>
        <p>Footy KPI is committed to maintaining a safe environment for youth athletes.</p>
        <p>Users may not use the Services to:</p>
        <ul>
          <li>Harass minors</li>
          <li>Solicit minors</li>
          <li>Groom minors</li>
          <li>Request inappropriate photographs</li>
          <li>Attempt to obtain a minor’s private information</li>
          <li>Arrange inappropriate contact with minors</li>
          <li>Engage in sexually explicit or exploitative conduct</li>
        </ul>
        <p>
          We may report suspected illegal activity to appropriate authorities when required or
          reasonably appropriate.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "24. DISCLAIMERS",
    content: (
      <>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICES ARE PROVIDED “AS IS” AND “AS
          AVAILABLE.”
        </p>
        <p>
          FOOTY KPI DISCLAIMS WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
          NON-INFRINGEMENT, AND ANY WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE OF TRADE,
          EXCEPT WHERE SUCH DISCLAIMERS ARE PROHIBITED BY LAW.
        </p>
      </>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "25. LIMITATION OF LIABILITY",
    content: (
      <>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, FOOTY KPI AND ITS OWNERS, OFFICERS, EMPLOYEES,
          CONTRACTORS, AND SERVICE PROVIDERS WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL,
          CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES ARISING FROM OR RELATED TO YOUR USE OF THE
          SERVICES.
        </p>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, FOOTY KPI’S TOTAL LIABILITY ARISING OUT OF OR
          RELATING TO THE SERVICES WILL NOT EXCEED THE GREATER OF THE AMOUNT YOU PAID TO FOOTY KPI
          DURING THE TWELVE MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM OR $100.
        </p>
        <p>
          Some jurisdictions do not permit certain limitations, so some provisions may not apply to
          you.
        </p>
      </>
    ),
  },
  {
    id: "indemnification",
    title: "26. INDEMNIFICATION",
    content: (
      <>
        <p>
          To the extent permitted by law, you agree to defend, indemnify, and hold harmless Footy
          KPI and its owners, officers, employees, contractors, and service providers from claims,
          damages, liabilities, and expenses arising from:
        </p>
        <ul>
          <li>Your violation of these Terms</li>
          <li>Your User Content</li>
          <li>Your violation of another person’s rights</li>
          <li>Your unauthorized use of the Services</li>
          <li>Your violation of applicable law</li>
        </ul>
      </>
    ),
  },
  {
    id: "changes-to-these-terms",
    title: "27. CHANGES TO THESE TERMS",
    content: (
      <>
        <p>We may update these Terms from time to time.</p>
        <p>
          If we make material changes, we may provide notice through the Services, by email, or by
          other reasonable means.
        </p>
        <p>
          Your continued use of the Services after the effective date of updated Terms constitutes
          acceptance of the revised Terms to the extent permitted by law.
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "28. GOVERNING LAW",
    content: (
      <>
        <p>
          These Terms will be governed by the laws of the State of Arizona, without regard to its
          conflict-of-law principles, except where applicable law requires otherwise.
        </p>
        <p>
          Any dispute will be handled in the courts having appropriate jurisdiction in Maricopa
          County, Arizona, unless applicable law requires a different venue.
        </p>
      </>
    ),
  },
  {
    id: "severability",
    title: "29. SEVERABILITY",
    content: (
      <>
        <p>
          If any provision of these Terms is determined to be invalid or unenforceable, the
          remaining provisions will remain in effect to the fullest extent permitted by law.
        </p>
      </>
    ),
  },
  {
    id: "entire-agreement",
    title: "30. ENTIRE AGREEMENT",
    content: (
      <>
        <p>
          These Terms, together with the Privacy Policy and any additional terms incorporated by
          reference, constitute the agreement between you and Footy KPI regarding your use of the
          Services.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "31. CONTACT",
    content: (
      <>
        <p>Questions regarding these Terms may be sent to:</p>
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
      <header className="border-b border-border/50 bg-surface pt-safe">
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
              <p className="mt-5 text-muted-foreground">Welcome to Footy KPI.</p>
              <p className="mt-3 text-muted-foreground">
                These Terms of Service (“Terms”) govern your access to and use of the Footy KPI
                mobile application, website, and related services (collectively, the “Services”).
              </p>
              <p className="mt-3 text-muted-foreground">
                By creating an account or using the Services, you agree to these Terms.
              </p>
              <p className="mt-3 text-muted-foreground">
                If you do not agree with these Terms, do not use Footy KPI.
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

            <div className="mt-12 rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-xl text-foreground">IMPORTANT NOTICE</h2>
              <p className="mt-3 text-muted-foreground">
                These Terms are a business/legal drafting starting point and are not a substitute for
                advice from a qualified attorney. Before launch, Footy KPI should have counsel
                review these Terms together with the actual app functionality, privacy practices,
                parental-consent workflow, subscription structure, and applicable state and federal
                children’s privacy requirements.
              </p>
            </div>
          </article>
        </div>
      </main>

      <footer className="border-t border-border/50 bg-surface py-6 pb-safe">
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
