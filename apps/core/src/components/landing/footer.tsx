import { Link } from '@tanstack/react-router'
import { FaFacebook, FaLinkedin, FaXTwitter } from 'react-icons/fa6'

const navigation = {
  product: [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ],
  resources: [
    { name: 'Help Center', href: '/help' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Security', href: '/security' },
  ],
  social: [
    {
      name: 'Facebook',
      href: 'https://facebook.com/yekoplatform',
      icon: FaFacebook,
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com/yekoplatform',
      icon: FaXTwitter,
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/yekoplatform',
      icon: FaLinkedin,
    },
  ],
}

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-8 space-y-6 md:space-y-0">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Product
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
              Resources
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
              Empowering Education Across Africa
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              &copy;
              {' '}
              {new Date().getFullYear()}
              {' '}
              Yeko Platform. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
