import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { FaFacebook, FaLinkedin, FaXTwitter } from 'react-icons/fa6'

export function Footer() {
  const { t } = useTranslation()

  const navigation = {
    product: [
      { name: t('footerNav.product.features'), href: '/#features' },
      { name: t('footerNav.product.pricing'), href: '/pricing' },
      { name: t('footerNav.product.about'), href: '/about' },
      { name: t('footerNav.product.contact'), href: '/contact' },
    ],
    resources: [
      { name: t('footerNav.resources.help'), href: '/help' },
      { name: t('footerNav.resources.privacy'), href: '/privacy' },
      { name: t('footerNav.resources.terms'), href: '/terms' },
      { name: t('footerNav.resources.security'), href: '/security' },
    ],
    social: [
      {
        name: t('footerNav.social.facebook'),
        href: 'https://facebook.com/yekoplatform',
        icon: FaFacebook,
      },
      {
        name: t('footerNav.social.twitter'),
        href: 'https://twitter.com/yekoplatform',
        icon: FaXTwitter,
      },
      {
        name: t('footerNav.social.linkedin'),
        href: 'https://linkedin.com/company/yekoplatform',
        icon: FaLinkedin,
      },
    ],
  }

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-8 space-y-6 md:space-y-0">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {t('footerNav.product.title')}
            </h3>
            <ul className="mt-2 space-y-1">
              {navigation.product.map(item => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center group"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {t('footerNav.resources.title')}
            </h3>
            <ul className="mt-2 space-y-1">
              {navigation.resources.map(item => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center group"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 md:mt-0 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="flex space-x-6">
            {navigation.social.map((item) => {
              const IconComponent = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <IconComponent className="h-5 w-5" />
                </a>
              )
            })}
          </div>

          <div className="text-center md:text-right">
            <p className="text-xs text-muted-foreground">
              {t('footerNav.tagline')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              &copy;
              {' '}
              {new Date().getFullYear()}
              {' '}
              {t('footerNav.copyright')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
