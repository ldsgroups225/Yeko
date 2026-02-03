import type { Locales } from '@/i18n/i18n-types'
import {
  IconBell,
  IconChartBar,
  IconLanguage,
  IconLogout,
  IconMoon,
  IconPencil,
  IconSchool,
  IconSettings,
  IconSun,
  IconUser,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Switch } from '@workspace/ui/components/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { useState } from 'react'
import { toast } from 'sonner'
import { useTheme } from '@/components/theme/use-theme'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { useI18nContext } from '@/i18n/i18n-react'
import { authClient } from '@/lib/auth-client'
import { getTeacherStats } from '@/teacher/functions/users'

export const Route = createFileRoute('/_auth/app/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { LL, locale, setLocale } = useI18nContext()
  const { context } = useRequiredTeacherContext()
  const { data: session } = authClient.useSession()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [newName, setNewName] = useState(session?.user.name || '')
  const [isSaving, setIsSaving] = useState(false)

  const { data: statsData } = useQuery({
    queryKey: ['teacher', 'stats', context?.teacherId],
    queryFn: () => getTeacherStats({ data: { teacherId: context?.teacherId ?? '', schoolYearId: context?.schoolYearId } }),
    enabled: !!context?.teacherId,
  })

  const handleLogout = async () => {
    try {
      await authClient.signOut()
      router.invalidate()
      router.navigate({ to: '/login' })
    }
    catch (error) {
      console.error('Logout failed', error)
    }
  }

  const handleUpdateProfile = async () => {
    if (!newName.trim())
      return

    setIsSaving(true)
    try {
      toast.success(LL.profile.updated())
      setIsEditProfileOpen(false)
      router.invalidate() // Refresh data
    }
    catch (error) {
      console.error('Failed to update profile', error)
      toast.error(LL.profile.updateError())
    }
    finally {
      setIsSaving(false)
    }
  }

  const getInitials = (name?: string) => {
    if (!name)
      return '??'
    return name.substring(0, 2).toUpperCase()
  }

  const stats = [
    { label: LL.profile.stats.schools(), value: statsData?.schoolsCount ?? '-', icon: IconSchool, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: LL.profile.stats.classes(), value: statsData?.classesCount ?? '-', icon: IconChartBar, color: 'text-green-500', bg: 'bg-green-500/10' },
  ]

  const user = session?.user

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <h1 className="text-xl font-semibold">{LL.nav.profile()}</h1>

      {/* Header Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.image ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                  {getInitials(user?.name ?? LL.profile.mainTeacher())}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
                onClick={() => {
                  setNewName(user?.name || '')
                  setIsEditProfileOpen(true)
                }}
              >
                <IconPencil className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{user?.name ?? LL.profile.mainTeacher()}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge variant="secondary" className="mt-2">
                {LL.profile.mainTeacher()}
              </Badge>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            {stats.map(stat => (
              <div key={stat.label + stat.bg} className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-3">
                <div className={`p-2 rounded-full ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{LL.profile.edit()}</DialogTitle>
            <DialogDescription>
              {LL.profile.editSubtitle()}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{LL.profile.fullName()}</Label>
              <Input
                id="name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder={LL.profile.namePlaceholder()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>{LL.common.cancel()}</Button>
            <Button onClick={handleUpdateProfile} disabled={isSaving}>
              {isSaving ? LL.profile.saving() : LL.profile.saveChanges()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Tabs */}
      <Tabs defaultValue="settings">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings" className="gap-2">
            <IconSettings className="w-4 h-4" />
            {LL.profile.settings()}
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <IconUser className="w-4 h-4" />
            {LL.profile.account()}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconSettings className="w-4 h-4" />
                {LL.profile.preferences()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <IconLanguage className="w-4 h-4" />
                  {LL.profile.language()}
                </Label>
                <Select
                  value={locale}
                  onValueChange={(value) => {
                    if (value)
                      setLocale(value as Locales)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {locale === 'fr' ? 'Français' : 'English'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Theme */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <IconSun className="w-4 h-4" />
                  {LL.profile.theme()}
                </Label>
                <Select
                  value={theme}
                  onValueChange={(val) => {
                    if (val === 'dark' || val === 'light' || val === 'system') {
                      setTheme(val)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {theme === 'light' && <IconSun className="w-4 h-4" />}
                        {theme === 'dark' && <IconMoon className="w-4 h-4" />}
                        {theme === 'system' && <IconSettings className="w-4 h-4" />}
                        {theme === 'light' ? LL.profile.themes.light() : theme === 'dark' ? LL.profile.themes.dark() : LL.profile.themes.system()}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <IconSun className="w-4 h-4" />
                        {LL.profile.themes.light()}
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <IconMoon className="w-4 h-4" />
                        {LL.profile.themes.dark()}
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <IconSettings className="w-4 h-4" />
                        {LL.profile.themes.system()}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <IconBell className="w-4 h-4" />
                  {LL.profile.notifications()}
                </Label>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconUser className="w-4 h-4" />
                {LL.profile.accountInfo()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-1">
                <p className="text-sm font-medium">{LL.auth.email()}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-sm font-medium">{LL.profile.teacherId()}</p>
                <p className="text-sm font-mono text-muted-foreground">{context?.teacherId}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-sm font-medium">{LL.profile.schoolId()}</p>
                <p className="text-sm text-muted-foreground">{context?.schoolId}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-sm font-medium">{LL.profile.schoolYear()}</p>
                <p className="text-sm text-muted-foreground">{context?.schoolYearId ?? LL.profile.notDefined()}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-sm font-medium">{LL.profile.memberSince()}</p>
                <p className="text-sm text-muted-foreground">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US') : LL.profile.notAvailable()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center text-sm text-muted-foreground">
              <p>
                {LL.profile.version()}
                {' '}
                1.0.0
              </p>
              <p className="mt-2">{LL.profile.copyright({ year: new Date().getFullYear().toString() })}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button variant="destructive" className="mt-4 w-full" onClick={handleLogout}>
        <IconLogout className="mr-2 w-4 h-4" />
        {LL.auth.logout()}
      </Button>
    </div>
  )
}
