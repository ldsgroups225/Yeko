import { motion } from 'motion/react'
import { useTranslations } from '@/i18n'

export function BrandPanel() {
  const t = useTranslations()
  const appName = t?.app?.name?.() || 'Yeko School'
  const tagline = t?.app?.tagline?.() || 'Gestion scolaire intelligente'

  return (
    <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-primary via-primary/90 to-primary/80 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="relative group shrink-0">
              <img
                src="/icon.png"
                alt="Yeko logo"
                className="size-16 rounded-2xl object-contain shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tighter text-white font-outfit uppercase">
                {appName}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">
                Administration
              </span>
            </div>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight">
            {tagline}
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            {t.auth.login.brandDescription()}
          </p>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          className="absolute bottom-12 left-12 xl:left-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center gap-4 text-white/60 text-sm">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="size-8 rounded-full bg-white/20 border-2 border-white/30"
                />
              ))}
            </div>
            <span>{t.auth.login.trustedBy()}</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
