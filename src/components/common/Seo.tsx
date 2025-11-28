import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SeoProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'application';
  structuredData?: object; // 允许传入自定义结构化数据
}

const APP_NAME = 'MapMotion';
const DEFAULT_TITLE = 'MapMotion - Professional Animated Map Creator';
const DEFAULT_DESCRIPTION = 'Create stunning cinematic map animations for your travel vlogs, documentaries, and business presentations in minutes.';
const DEFAULT_KEYWORDS = ['map animation', 'travel route', 'video editor', 'geo motion', '3d maps', 'vlog tools'];
const DEFAULT_IMAGE = '/og-image.jpg';
const SITE_URL = 'https://mapmotion.app';

export const Seo: React.FC<SeoProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_IMAGE,
  url = SITE_URL,
  type = 'website',
  structuredData,
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  
  const fullTitle = title ? `${title} | ${APP_NAME}` : DEFAULT_TITLE;
  const fullUrl = url === SITE_URL ? SITE_URL : `${SITE_URL}${url}`;

  // 默认结构化数据 (SoftwareApplication)
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": APP_NAME,
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": description
  };

  // 最终使用的结构化数据
  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* 基础 Meta */}
      <html lang={currentLang} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={APP_NAME} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={fullUrl} />

      {/* 多语言 Hreflang 标签 - 关键 SEO 优化 */}
      <link rel="alternate" href={`${SITE_URL}`} hrefLang="x-default" />
      <link rel="alternate" href={`${SITE_URL}/zh`} hrefLang="zh-CN" />
      <link rel="alternate" href={`${SITE_URL}/en`} hrefLang="en" />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={APP_NAME} />
      <meta property="og:locale" content={currentLang === 'zh-CN' ? 'zh_CN' : 'en_US'} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@mapmotion" />

      {/* JSON-LD 结构化数据 */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
    </Helmet>
  );
};
