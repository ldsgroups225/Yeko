import { Link } from '@tanstack/react-router'
import { FaFacebook, FaLinkedin, FaXTwitter } from 'react-icons/fa6'
import { useI18nContext } from '@/i18n/i18n-react'

export function Footer() {
  const { LL } = useI18nContext()

  const navigation = {
    product: [
      { name: LL.footerNav.product.features(), href: '/#features' },
      { name: LL.footerNav.product.pricing(), href: '/pricing' },
      { name: LL.footerNav.product.about(), href: '/about' },
      { name: LL.footerNav.product.contact(), href: '/contact' },
    ],
    resources: [
      { name: LL.footerNav.resources.help(), href: '/help' },
      { name: LL.footerNav.resources.privacy(), href: '/privacy' },
      { name: LL.footerNav.resources.terms(), href: '/terms' },
      { name: LL.footerNav.resources.security(), href: '/security' },
    ],
    social: [
      {
        name: LL.footerNav.social.facebook(),
        href: 'https://facebook.com/yekoplatform',
        icon: FaFacebook,
      },
      {
        name: LL.footerNav.social.twitter(),
        href: 'https://twitter.com/yekoplatform',
        icon: FaXTwitter,
      },
      {
        name: LL.footerNav.social.linkedin(),
        href: 'https://linkedin.com/company/yekoplatform',
        icon: FaLinkedin,
      },
    ],
  }

  return (
    <footer className="bg-background border-t">
      <div className="
        mx-auto max-w-7xl px-6 py-12
        md:flex md:items-center md:justify-between
        lg:px-8
      "
      >
        <div className="
          flex flex-col space-y-6
          md:flex-row md:items-center md:space-y-0 md:space-x-8
        "
        >
          <div>
            <h3 className="text-foreground text-sm font-semibold">
              {LL.footerNav.product.title()}
            </h3>
            <ul className="mt-2 space-y-1">
              {navigation.product.map(item => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="
                      text-muted-foreground
                      hover:text-foreground
                      group inline-flex items-center text-sm
                    "
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-foreground text-sm font-semibold">
              {LL.footerNav.resources.title()}
            </h3>
            <ul className="mt-2 space-y-1">
              {navigation.resources.map(item => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="
                      text-muted-foreground
                      hover:text-foreground
                      group inline-flex items-center text-sm
                    "
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="
          mt-8 flex flex-col space-y-4
          md:mt-0 md:flex-row md:items-center md:space-y-0 md:space-x-6
        "
        >
          <div className="flex space-x-6">
            {navigation.social.map((item) => {
              const IconComponent = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    text-muted-foreground
                    hover:text-foreground
                    transition-colors
                  "
                >
                  <span className="sr-only">{item.name}</span>
                  <IconComponent className="h-5 w-5" />
                </a>
              )
            })}
          </div>

          <div className="
            text-center
            md:text-right
          "
          >
            <p className="text-muted-foreground text-xs">
              {LL.footerNav.tagline()}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {LL.footerNav.copyright({ year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
