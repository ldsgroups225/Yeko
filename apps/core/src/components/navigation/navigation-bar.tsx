import {
  IconBrandGithub,
  IconExternalLink,
  IconLogin,
  IconMenu,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AccountDialog } from "@/components/auth/account-dialog";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface NavigationItem {
  label: string;
  href: string;
  isExternal?: boolean;
  scrollTo?: string;
}

export function NavigationBar() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = authClient.useSession();

  const navigationItems: NavigationItem[] = [
    { label: t("nav.solutions"), href: "/#solutions", scrollTo: "solutions" },
    { label: t("nav.benefits"), href: "/#benefits", scrollTo: "benefits" },
    { label: t("nav.pricing"), href: "/#pricing", scrollTo: "pricing" },
    { label: "About", href: "/about", isExternal: false },
  ];

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/app",
    });
  };

  const handleNavClick = (item: NavigationItem) => {
    if (item.scrollTo) {
      const element = document.getElementById(item.scrollTo);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsOpen(false);
  };

  const user = session?.user;
  const fallbackText = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "U";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-primary/5"
          : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo and Brand */}
          <Link
            to="/"
            className="group flex items-center space-x-3 no-underline"
          >
            <motion.img
              src="/icon.png"
              alt="Yeko Logo"
              className="h-10 w-10 lg:h-12 lg:w-12 object-contain"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            />
            <div className="flex flex-col">
              <span className="text-lg lg:text-xl font-bold bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/80 transition-all duration-300">
                Yeko Platform
              </span>
              <span className="text-xs text-muted-foreground font-medium tracking-wider">
                {t("nav.tagline")}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <motion.div
            className="hidden lg:flex items-center space-x-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, staggerChildren: 0.1 }}
          >
            {navigationItems.map((item, index) => (
              <motion.div
                key={item.label}
                className="relative group"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ y: -2 }}
              >
                {item.isExternal ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 hover:bg-accent/50 group"
                  >
                    <span>{item.label}</span>
                    {item.label === "GitHub" ? (
                      <IconBrandGithub className="h-4 w-4" />
                    ) : (
                      <IconExternalLink className="h-4 w-4" />
                    )}
                  </a>
                ) : (
                  <Link
                    to={item.href}
                    onClick={() => handleNavClick(item)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 hover:bg-accent/50 block"
                  >
                    {item.label}
                  </Link>
                )}
                <motion.div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 bg-linear-to-r from-primary to-primary/80"
                  initial={{ width: 0 }}
                  whileHover={{ width: "75%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}

            {/* Theme Toggle & Language Switcher */}
            <div className="ml-2 pl-2 border-l border-border/30 flex items-center gap-1">
              <LanguageSwitcher />
              <ThemeToggle variant="ghost" align="end" />
            </div>
          </motion.div>

          {/* Action Buttons - Desktop */}
          <div className="hidden lg:block">
            {session ? (
              <div className="flex flex-row items-center gap-4">
                <Button
                  variant="secondary"
                  render={<Link to="/app">{t("nav.dashboard")}</Link>}
                />

                <AccountDialog>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-3"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage
                        src={user?.image || undefined}
                        alt={user?.name || "User"}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {fallbackText}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {user?.name || "Account"}
                    </span>
                  </Button>
                </AccountDialog>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  render={
                    <Link to="/demo-request">{t("nav.requestDemo")}</Link>
                  }
                />
                <Button
                  onClick={handleGoogleSignIn}
                  variant="default"
                  size="sm"
                  className="gap-2"
                >
                  <IconLogin className="h-4 w-4" />
                  {t("nav.signIn")}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button + Language + Theme Toggle */}
          <div className="lg:hidden flex items-center space-x-1">
            <LanguageSwitcher />
            <ThemeToggle variant="ghost" align="end" />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10 hover:bg-accent/50"
                >
                  <IconMenu className="h-5 w-5" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] bg-background/95 backdrop-blur-xl border-l border-border/50"
              >
                <SheetHeader className="text-left space-y-1 pb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src="/icon.png"
                      alt="Yeko Logo"
                      className="h-10 w-10 object-contain"
                    />
                    <SheetTitle className="text-xl font-bold bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                      {t("nav.menuTitle")}
                    </SheetTitle>
                  </div>
                  <SheetDescription className="text-muted-foreground">
                    {t("nav.menuDescription")}
                  </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col space-y-2 pb-6">
                  {navigationItems.map((item) => (
                    <div key={item.label} className="relative group">
                      {item.isExternal ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 hover:bg-accent/50"
                          onClick={() => setIsOpen(false)}
                        >
                          <span>{item.label}</span>
                          {item.label === "GitHub" ? (
                            <IconBrandGithub className="h-4 w-4" />
                          ) : (
                            <IconExternalLink className="h-4 w-4" />
                          )}
                        </a>
                      ) : (
                        <Link
                          to={item.href}
                          onClick={() => handleNavClick(item)}
                          className="flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 hover:bg-accent/50 text-left"
                        >
                          {item.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                {/* Mobile Actions */}
                <div className="pt-4 border-t border-border/50">
                  {session ? (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-accent/30">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={user?.image || undefined}
                          alt={user?.name || "User"}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {fallbackText}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        render={
                          <Link to="/demo-request">{t("nav.requestDemo")}</Link>
                        }
                      />
                      <Button
                        onClick={handleGoogleSignIn}
                        variant="default"
                        className="w-full gap-2"
                      >
                        <IconLogin className="h-4 w-4" />
                        {t("nav.signInWithGoogle")}
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
