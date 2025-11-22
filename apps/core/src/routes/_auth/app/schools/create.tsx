import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  Building,
  Mail,
  MapPin,
  Save,
  School,
  Upload,
} from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useLogger } from '@/lib/logger'

export const Route = createFileRoute('/_auth/app/schools/create')({
  component: CreateSchool,
})

function CreateSchool() {
  const navigate = useNavigate()
  const { logger } = useLogger()

  React.useEffect(() => {
    logger.info('Create school page viewed', {
      page: 'schools-create',
      timestamp: new Date().toISOString(),
    })
  }, [logger])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement school creation logic
    logger.info('School creation attempted', {
      action: 'create_school',
      timestamp: new Date().toISOString(),
    })
    // Navigate back to schools list after successful creation
    navigate({ to: '/app/schools' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/app/schools' })}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Créer une École</h1>
          <p className="text-muted-foreground">
            Ajouter une nouvelle école partenaire à l'écosystème Yeko
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Informations de Base
              </CardTitle>
              <CardDescription>
                Détails essentiels sur l'école
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l'École *</Label>
                  <Input
                    id="name"
                    placeholder="Entrer le nom de l'école"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code de l'École *</Label>
                  <Input
                    id="code"
                    placeholder="e.g., LYCE-001"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brève description de l'école..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo de l'École</Label>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <Button type="button" variant="outline" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Télécharger Logo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG jusqu'à 2MB
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Informations de Contact
              </CardTitle>
              <CardDescription>
                Comment contacter l'école
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Adresse Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="school@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de Téléphone *</Label>
                <Input
                  id="phone"
                  placeholder="+33 1 23 45 67 89"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Site Web</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.school-website.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Informations de Localisation
              </CardTitle>
              <CardDescription>
                Adresse physique de l'école
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  placeholder="123 Avenue de la République"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville *</Label>
                  <Input
                    id="city"
                    placeholder="Paris"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Code Postal *</Label>
                  <Input
                    id="postalCode"
                    placeholder="75001"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="country">Pays *</Label>
                  <Input
                    id="country"
                    placeholder="France"
                    defaultValue="France"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Région/État</Label>
                  <Input
                    id="region"
                    placeholder="Île-de-France"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* School Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Configuration de l'École
            </CardTitle>
            <CardDescription>
              Options de configuration initiale
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxStudents">Nombre Maximum d'Étudiants</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  placeholder="2000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxTeachers">Nombre Maximum d'Enseignants</Label>
                <Input
                  id="maxTeachers"
                  type="number"
                  placeholder="150"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut Initial</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                defaultValue="pending"
              >
                <option value="pending">En attente - Nécessite une approbation</option>
                <option value="active">Active - Immédiatement active</option>
                <option value="inactive">Inactive - Configurer plus tard</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: '/app/schools' })}
          >
            Annuler
          </Button>
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            Créer l'École
          </Button>
        </div>
      </form>
    </div>
  )
}
