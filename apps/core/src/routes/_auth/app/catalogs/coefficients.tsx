import { createFileRoute } from '@tanstack/react-router'
import {
  Calculator,
  Download,
  Edit,
  Plus,
  Save,
  Upload,
} from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useLogger } from '@/lib/logger'

export const Route = createFileRoute('/_auth/app/catalogs/coefficients')({
  component: CoefficientsCatalog,
})

function CoefficientsCatalog() {
  const { logger } = useLogger()

  useEffect(() => {
    logger.info('Coefficients catalog page viewed', {
      page: 'coefficients-catalog',
      timestamp: new Date().toISOString(),
    })
  }, [logger])

  // Mock coefficients matrix data
  const coefficientsMatrix = [
    { 'subject': 'Mathématiques', '6ème': 3, '5ème': 3, '4ème': 3, '3ème': 3, '2nde': 4, '1èreS': 5, '1èreA': 3, 'TerminaleS': 7, 'TerminaleA': 4 },
    { 'subject': 'Français', '6ème': 4, '5ème': 4, '4ème': 4, '3ème': 4, '2nde': 3, '1èreS': 3, '1èreA': 4, 'TerminaleS': 3, 'TerminaleA': 5 },
    { 'subject': 'Physique-Chimie', '6ème': 2, '5ème': 2, '4ème': 3, '3ème': 3, '2nde': 3, '1èreS': 5, '1èreA': 0, 'TerminaleS': 6, 'TerminaleA': 0 },
    { 'subject': 'SVT', '6ème': 2, '5ème': 2, '4ème': 3, '3ème': 3, '2nde': 3, '1èreS': 5, '1èreA': 0, 'TerminaleS': 6, 'TerminaleA': 0 },
    { 'subject': 'Histoire-Géographie', '6ème': 2, '5ème': 2, '4ème': 2, '3ème': 2, '2nde': 3, '1èreS': 2, '1èreA': 3, 'TerminaleS': 2, 'TerminaleA': 3 },
  ]

  const grades = ['6ème', '5ème', '4ème', '3ème', '2nde', '1èreS', '1èreA', 'TerminaleS', 'TerminaleA']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coefficient Templates</h1>
          <p className="text-muted-foreground">
            Define subject coefficients for grade calculations across different grade levels and series
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Matrix
          </Button>
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import Excel
          </Button>
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardContent className="py-6">
          <div className="text-center">
            <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Coefficient Matrix Management</h3>
            <p className="text-muted-foreground mb-4">
              Define and manage coefficient templates for calculating student averages.
              These templates will be used by all schools for grade calculations.
            </p>
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div>
                <strong>Editing Mode:</strong>
                {' '}
                Click on any coefficient value to edit
              </div>
              <div>
                <strong>School Year:</strong>
                {' '}
                2025-2026
              </div>
              <div>
                <strong>Auto-Save:</strong>
                {' '}
                Changes are saved automatically
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coefficient Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Coefficient Matrix View</CardTitle>
          <CardDescription>
            Interactive matrix showing coefficients for each subject across different grade levels and series
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 bg-muted">Subject</th>
                  {grades.map(grade => (
                    <th key={grade} className="text-center p-3 bg-muted min-w-20">
                      {grade}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coefficientsMatrix.map((row, index) => (
                  <tr key={row.subject} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                    <td className="font-medium p-3 border-r">
                      {row.subject}
                    </td>
                    {grades.map(grade => (
                      <td key={grade} className="text-center p-3">
                        <Input
                          type="number"
                          value={row[grade as keyof typeof row] || 0}
                          onChange={(e) => {
                            // TODO: Implement coefficient update logic
                            console.warn(`Updating ${row.subject} ${grade} to ${e.target.value}`)
                          }}
                          className="w-16 mx-auto text-center"
                          min="0"
                          max="10"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Copy from Previous Year</CardTitle>
            <CardDescription>
              Copy coefficients from 2024-2025 school year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full gap-2">
              <Calculator className="h-4 w-4" />
              Copy from 2024-2025
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Series Templates</CardTitle>
            <CardDescription>
              Create coefficient templates for different series
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Manage Series
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Validation Rules</CardTitle>
            <CardDescription>
              Configure coefficient validation and limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full gap-2">
              <Edit className="h-4 w-4" />
              Configure Rules
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Note */}
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Advanced Coefficient Management Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              Full coefficient management features will be available in Phase 8: Coefficient Configuration
            </p>
            <div className="text-sm text-muted-foreground">
              <p>Features coming:</p>
              <ul className="mt-2 space-y-1">
                <li>• Bulk coefficient editing</li>
                <li>• Import/Export from Excel</li>
                <li>• Historical coefficient tracking</li>
                <li>• School-specific overrides</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
