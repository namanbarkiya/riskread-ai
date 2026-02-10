import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { ErrorBoundary } from "@/components/error";
import {
  QueryProvider,
  SonnerProvider,
} from "@/components/providers";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "RiskRead AI - Intelligent Document Risk Analysis",
    template: "%s | RiskRead AI",
  },
  description:
    "RiskRead AI is an intelligent document analysis platform that uses advanced AI to identify, assess, and mitigate risks in your documents. Get instant risk insights, compliance checks, and actionable recommendations.",
  applicationName: "RiskRead AI",
  keywords: [
    "document risk analysis",
    "AI risk assessment",
    "compliance checking",
    "document security",
    "risk management",
    "AI document analysis",
    "legal document review",
    "contract risk analysis",
    "regulatory compliance",
    "document intelligence",
    "risk mitigation",
    "AI-powered analysis",
    "document processing",
    "risk scoring",
    "automated risk detection",
  ],
  authors: [{ name: "RiskRead AI Team", url: "https://riskread.ai" }],
  creator: "RiskRead AI",
  publisher: "RiskRead AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://riskread.ai"),
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
  themeColor: "#00AB8D",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://riskread.ai",
    title: "RiskRead AI - Intelligent Document Risk Analysis",
    description:
      "Advanced AI-powered document risk analysis platform. Identify, assess, and mitigate risks in your documents with intelligent insights and compliance checking.",
    siteName: "RiskRead AI",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "RiskRead AI Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RiskRead AI - Intelligent Document Risk Analysis",
    description:
      "Advanced AI-powered document risk analysis platform. Identify, assess, and mitigate risks in your documents with intelligent insights and compliance checking.",
    creator: "@riskreadai",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your actual verification codes here when you have them
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* THEME FIX: Prevent FOUC by setting theme before React loads */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
                        `,
          }}
        />
        {/* Structured Data for Software Application */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "RiskRead AI",
              description:
                "Intelligent document risk analysis platform that uses advanced AI to identify, assess, and mitigate risks in documents with compliance checking and actionable recommendations.",
              url: "https://riskread.ai",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web Browser",
              author: {
                "@type": "Organization",
                name: "RiskRead AI",
                url: "https://riskread.ai",
              },
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              softwareVersion: "1.0.0",
              datePublished: "2025-01-01",
              downloadUrl: "https://riskread.ai",
              image: "/logo.png",
              featureList: [
                "AI-powered document analysis",
                "Risk identification and assessment",
                "Compliance checking",
                "Legal document review",
                "Contract risk analysis",
                "Regulatory compliance",
                "Automated risk detection",
                "Risk scoring and insights",
                "Document intelligence",
                "Real-time analysis",
              ],
            }),
          }}
        />
        {/* Structured Data for Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "RiskRead AI - Intelligent Document Risk Analysis",
              url: "https://riskread.ai",
              description:
                "Advanced AI-powered document risk analysis platform for identifying, assessing, and mitigating risks in documents",
              publisher: {
                "@type": "Organization",
                name: "RiskRead AI",
                url: "https://riskread.ai",
              },
              potentialAction: {
                "@type": "SearchAction",
                target: "https://riskread.ai/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        {/* Additional SEO Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="msapplication-TileColor" content="#00AB8D" />
      </head>
      <body className={`${dmSans.className} antialiased`}>
        <ErrorBoundary>
          <QueryProvider>
            <div className="flex flex-col min-h-screen">
              <main className="flex-grow">{children}</main>
            </div>
            <SonnerProvider />
          </QueryProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
