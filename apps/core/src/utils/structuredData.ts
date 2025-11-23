export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  'name': 'Yeko',
  'description': 'Smart School Management Platform',
  'url': 'https://yeko.com',
  'logo': {
    '@type': 'ImageObject',
    'url': 'https://yeko.com/logo.png',
    'width': 512,
    'height': 512,
  },
  'sameAs': [
    'https://twitter.com/yeko_app',
    'https://linkedin.com/company/yeko',
  ],
  'contactPoint': {
    '@type': 'ContactPoint',
    'telephone': '+1-555-SCHOOL',
    'contactType': 'customer service',
    'availableLanguage': ['English', 'Spanish', 'French'],
  },
}

export const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  'name': 'Yeko School Management Platform',
  'description': 'Comprehensive school management platform for educational institutions',
  'url': 'https://yeko.com',
  'applicationCategory': 'BusinessApplication',
  'operatingSystem': 'Web Browser',
  'offers': {
    '@type': 'Offer',
    'price': '0',
    'priceCurrency': 'USD',
    'description': 'Free tier available with premium features',
  },
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': '4.8',
    'ratingCount': '1250',
  },
  'creator': {
    '@type': 'Organization',
    'name': 'Yeko',
    'url': 'https://yeko.com',
  },
}

export const educationalOrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  'name': 'Yeko',
  'description': 'Smart School Management Platform for modern educational institutions',
  'url': 'https://yeko.com',
  'hasCredential': {
    '@type': 'EducationalOccupationalCredential',
    'name': 'School Management System Certification',
    'credentialCategory': 'Educational',
  },
  'provider': {
    '@type': 'Organization',
    'name': 'Yeko Technologies Inc.',
  },
}

export const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  'name': 'Yeko',
  'url': 'https://yeko.com',
  'description': 'Smart School Management Platform',
  'potentialAction': {
    '@type': 'SearchAction',
    'target': 'https://yeko.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
  'publisher': {
    '@type': 'Organization',
    'name': 'Yeko',
    'url': 'https://yeko.com',
  },
}

export function breadcrumbSchema(breadcrumbs: Array<{ name: string, url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': crumb.name,
      'item': crumb.url,
    })),
  }
}

export function faqSchema(faqs: Array<{ question: string, answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer,
      },
    })),
  }
}

export function generateStructuredData(type: string, data?: any) {
  switch (type) {
    case 'organization':
      return organizationSchema
    case 'software':
      return softwareApplicationSchema
    case 'educational':
      return educationalOrganizationSchema
    case 'website':
      return webSiteSchema
    case 'breadcrumb':
      return breadcrumbSchema(data || [])
    case 'faq':
      return faqSchema(data || [])
    default:
      return organizationSchema
  }
}
