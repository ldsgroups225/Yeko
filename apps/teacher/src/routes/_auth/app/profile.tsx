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
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useTheme } from '@/components/theme/use-theme'
import { useRequiredTeacherContext } from '@/hooks/use-teacher-context'
import { authClient } from '@/lib/auth-client'
import { getTeacherStats } from '@/teacher/functions/users'

export const Route = createFileRoute('/_auth/app/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { t, i18n } = useTranslation()
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
      await authClient.updateUser({
        name: newName,
      })
      toast.success('Profil mis à jour')
      setIsEditProfileOpen(false)
      router.invalidate() // Refresh data
    }
    catch (error) {
      console.error('Failed to update profile', error)
      toast.error('Erreur lors de la mise à jour')
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
    { label: t('nav.ecole', 'École'), value: statsData?.classesCount ?? '-', icon: IconSchool, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: t('nav.grades', 'Notes'), value: statsData?.gradesCount ?? '-', icon: IconChartBar, color: 'text-green-500', bg: 'bg-green-500/10' },
  ]

  const user = session?.user

  return (
    <div className="flex flex-col gap-4 p-4 pb-20">
      <h1 className="text-xl font-semibold">{t('nav.profile', 'Profil')}</h1>

      {/* Header Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.image ?? undefined} />
                <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                  {getInitials(user?.name ?? 'Enseignant')}
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
              <h2 className="text-xl font-semibold">{user?.name ?? 'Enseignant'}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge variant="secondary" className="mt-2">
                Enseignant principal
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
            <DialogTitle>Modifier le profil</DialogTitle>
            <DialogDescription>
              Modifiez vos informations personnelles ici.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Votre nom"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>Annuler</Button>
            <Button onClick={handleUpdateProfile} disabled={isSaving}>
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Tabs */}
      <Tabs defaultValue="settings">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings" className="gap-2">
            <IconSettings className="w-4 h-4" />
            Paramètres
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <IconUser className="w-4 h-4" />
            Compte
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <IconSettings className="w-4 h-4" />
                Préférences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <IconLanguage className="w-4 h-4" />
                  Langue
                </Label>
                <Select
                  value={i18n.language}
                  onValueChange={(value) => {
                    if (value)
                      i18n.changeLanguage(value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {i18n.language === 'fr' ? 'Français' : 'English'}
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
                  Thème
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
                        {theme === 'light' ? 'Clair' : theme === 'dark' ? 'Sombre' : 'Système'}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <IconSun className="w-4 h-4" />
                        Clair
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <IconMoon className="w-4 h-4" />
                        Sombre
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <IconSettings className="w-4 h-4" />
                        Système
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <IconBell className="w-4 h-4" />
                  Notifications
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
                Informations du compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-1">
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-sm font-medium">ID Enseignant</p>
                <p className="text-sm font-mono text-muted-foreground">{context?.teacherId}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-sm font-medium">École</p>
                <p className="text-sm text-muted-foreground">{context?.schoolId}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-sm font-medium">Année Scolaire</p>
                <p className="text-sm text-muted-foreground">{context?.schoolYearId ?? 'Non définie'}</p>
              </div>
              <div className="grid gap-1">
                <p className="text-sm font-medium">Membre depuis</p>
                <p className="text-sm text-muted-foreground">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'Non disponible'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center text-sm text-muted-foreground">
              <p>Version 1.0.0</p>
              <p className="mt-2">© 2024 Yeko. Tous droits réservés.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button variant="destructive" className="mt-4 w-full" onClick={handleLogout}>
        <IconLogout className="mr-2 w-4 h-4" />
        {t('auth.logout', 'Déconnexion')}
      </Button>
    </div>
  )
}
