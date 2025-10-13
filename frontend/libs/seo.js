import config from "@/config";

// SEO 기본값 상수
const DEFAULT_SEO = {
  locale: "ko_KR",
  type: "website",
  cardType: "summary_large_image",
  twitterCreator: "@nomadjun195",
};

// OpenGraph 메타데이터 생성 함수
const createOpenGraphMetadata = (openGraph = {}) => ({
  title: openGraph.title || config.appName,
  description: openGraph.description || config.appDescription,
  url: openGraph.url || `https://${config.domainName}/`,
  siteName: openGraph.title || config.appName,
  locale: DEFAULT_SEO.locale,
  type: DEFAULT_SEO.type,
});

// Twitter 메타데이터 생성 함수
const createTwitterMetadata = (openGraph = {}) => ({
  title: openGraph.title || config.appName,
  description: openGraph.description || config.appDescription,
  card: DEFAULT_SEO.cardType,
  creator: DEFAULT_SEO.twitterCreator,
});

// Schema.org 데이터 생성 함수
const createSchemaData = () => ({
  "@context": "http://schema.org",
  "@type": "SoftwareApplication",
  name: config.appName,
  description: config.appDescription,
  image: `https://${config.domainName}/icon.png`,
  url: `https://${config.domainName}/`,
  author: {
    "@type": "Person",
    name: "Marc Lou",
  },
  datePublished: "2023-08-01",
  applicationCategory: "EducationalApplication",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "12",
  },
  offers: [
    {
      "@type": "Offer",
      price: "9.00",
      priceCurrency: "USD",
    },
  ],
});

export const getSEOTags = ({
  title,
  description,
  keywords,
  openGraph,
  canonicalUrlRelative,
  extraTags,
} = {}) => {
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/"
      : `https://${config.domainName}/`;

  return {
    title: title || config.appName,
    description: description || config.appDescription,
    keywords: keywords || [config.appName],
    applicationName: config.appName,
    metadataBase: new URL(baseUrl),
    openGraph: createOpenGraphMetadata(openGraph),
    twitter: createTwitterMetadata(openGraph),
    ...(canonicalUrlRelative && {
      alternates: { canonical: canonicalUrlRelative },
    }),
    ...extraTags,
  };
};

export const renderSchemaTags = () => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(createSchemaData()),
    }}
  />
);
