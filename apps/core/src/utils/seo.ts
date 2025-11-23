export function seo({
  title,
  description,
  keywords,
  image,
  url,
  canonical,
  noindex,
  type = 'website',
  locale = 'en_US',
  siteName = 'Yeko',
  author = 'Yeko Team',
}: {
  title: string
  description?: string
  image?: string
  keywords?: string
  url?: string
  canonical?: string
  noindex?: boolean
  type?: string
  locale?: string
  siteName?: string
  author?: string
}) {
  const tags = [
    { title },
    { name: 'description', content: description },
    { name: 'keywords', content: keywords },
    { name: 'author', content: author },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'robots', content: noindex ? 'noindex,nofollow' : 'index,follow' },
    { name: 'googlebot', content: noindex ? 'noindex,nofollow' : 'index,follow' },
    { name: 'language', content: 'English' },

    // Open Graph tags
    { property: 'og:type', content: type },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:site_name', content: siteName },
    { property: 'og:locale', content: locale },
    { property: 'og:url', content: url || canonical },

    // Twitter Card tags
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:creator', content: '@yeko_app' },
    { name: 'twitter:site', content: '@yeko_app' },
    { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' },

    // Additional meta tags
    { name: 'application-name', content: siteName },
    { name: 'apple-mobile-web-app-title', content: siteName },
    { name: 'theme-color', content: '#000000' },
    { name: 'msapplication-TileColor', content: '#000000' },

    ...(image
      ? [
          { name: 'twitter:image', content: image },
          { name: 'og:image', content: image },
          { name: 'og:image:alt', content: `${title} - ${description}` },
        ]
      : []),

    ...(canonical
      ? [
          { rel: 'canonical', href: canonical },
        ]
      : []),
  ]

  return tags
}
