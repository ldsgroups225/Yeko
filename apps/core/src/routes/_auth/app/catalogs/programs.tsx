import { createFileRoute } from '@tanstack/react-router'
import {
  BookOpen,
  Calendar,
  Clock,
  Copy,
  Database,
  Edit,
  Plus,
  Trash2,
} from 'lucide-react'
import { useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useLogger } from '@/lib/logger'

export const Route = createFileRoute('/_auth/app/catalogs/programs')({
  component: ProgramsCatalog,
})

function ProgramsCatalog() {
  const { logger } = useLogger()

  useEffect(() => {
    logger.info('Programs catalog page viewed', {
      page: 'programs-catalog',
      timestamp: new Date().toISOString(),
    })
  }, [logger])

  // Mock data for demonstration
  const programs = [
    {
      id: 1,
      name: 'Mathématiques - Terminale S',
      subject: 'Mathématiques',
      grade: 'Terminale',
      series: 'S',
      schoolYear: '2025-2026',
      chapters: 45,
      status: 'published',
      createdAt: '2025-01-10',
      lastModified: '2025-01-15',
    },
    {
      id: 2,
      name: 'Physique-Chimie - Première S',
      subject: 'Physique-Chimie',
      grade: 'Première',
      series: 'S',
      schoolYear: '2025-2026',
      chapters: 38,
      status: 'draft',
      createdAt: '2025-01-11',
      lastModified: '2025-01-14',
    },
    {
      id: 3,
      name: 'Français - Seconde',
      subject: 'Français',
      grade: 'Seconde',
      series: 'Général',
      schoolYear: '2025-2026',
      chapters: 28,
      status: 'published',
      createdAt: '2025-01-12',
      lastModified: '2025-01-13',
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Published</Badge>
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Draft</Badge>
      case 'archived':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Archived</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Program Templates</h1>
          <p className="text-muted-foreground">
            Ministerial programs and curriculum templates for different subjects and grades
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Copy className="h-4 w-4" />
            Clone from Previous Year
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Program
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programs.length}</div>
            <p className="text-xs text-muted-foreground">Active templates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programs.filter(p => p.status === 'published').length}</div>
            <p className="text-xs text-muted-foreground">Ready for use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programs.filter(p => p.status === 'draft').length}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">School Year</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2025-2026</div>
            <p className="text-xs text-muted-foreground">Active year</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Programs</CardTitle>
          <CardDescription>Find specific program templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Input
              placeholder="Search by subject, grade, or series..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Programs List */}
      <Card>
        <CardHeader>
          <CardTitle>All Program Templates</CardTitle>
          <CardDescription>Complete list of ministerial program templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {programs.map(program => (
              <div
                key={program.id}
                className="flex items-center justify-between p-6 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Database className="h-6 w-6 text-primary" />
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{program.name}</h3>
                      {getStatusBadge(program.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>{program.subject}</span>
                      <span>•</span>
                      <span>{program.grade}</span>
                      <span>•</span>
                      <span>{program.series}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>
                        {program.chapters}
                        {' '}
                        chapters
                      </span>
                      <span>•</span>
                      <span>{program.schoolYear}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Placeholder message */}
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Program Management Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              Full program template management will be available in Phase 7: Ministerial Programs
            </p>
            <Button variant="outline">
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
