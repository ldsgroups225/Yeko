import type { FormEvent } from 'react'
import { IconArrowLeft, IconCircleCheck } from '@tabler/icons-react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select'
import { Textarea } from '@workspace/ui/components/textarea'
import { useState } from 'react'
import { useTranslations } from '@/i18n/hooks'

export const Route = createFileRoute('/demo-request')({
  component: DemoRequest,
})

function DemoRequest() {
  const t = useTranslations()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    schoolName: '',
    schoolType: '',
    role: '',
    studentsCount: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call - replace with actual submission logic
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Here you would typically send the data to your backend
      console.warn('Demo request submitted:', formData)

      setIsSubmitted(true)
    }
    catch (error) {
      console.error('Error submitting demo request:', error)
    }
    finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="
        from-background to-muted/20 min-h-screen bg-linear-to-b px-4 py-12
      "
      >
        <div className="container mx-auto max-w-2xl">
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="mb-4">
                <IconArrowLeft className="mr-2 h-4 w-4" />
                {t.common.back()}
              </Button>
            </Link>
          </div>

          <Card className="text-center">
            <CardContent className="pt-6">
              <IconCircleCheck className="text-primary mx-auto mb-4 h-16 w-16" />
              <CardTitle className="mb-2">{t.demoRequest.form.success()}</CardTitle>
              <CardDescription className="mb-6 text-lg">
                {t.demoRequest.form.successDescription()}
              </CardDescription>
              <p className="text-muted-foreground mb-6">
                {t.demoRequest.form.confirmationEmail({ email: formData.email })}
              </p>
              <div className="flex justify-center gap-4">
                <Link to="/">
                  <Button variant="outline">{t.common.back()}</Button>
                </Link>
                <Button onClick={() => window.location.href = 'mailto:demo@yeko.com'}>
                  {t.common.support()}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="
      from-background to-muted/20 min-h-screen bg-linear-to-b px-4 py-12
    "
    >
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              {t.common.back()}
            </Button>
          </Link>

          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold">{t.demoRequest.title()}</h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              {t.demoRequest.subtitle()}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t.demoRequest.title()}</CardTitle>
            <CardDescription>
              {t.demoRequest.subtitle()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="
                grid gap-6
                md:grid-cols-2
              "
              >
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {t.demoRequest.form.name()}
                    {' '}
                    *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder="Jean Dupont"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t.demoRequest.form.email()}
                    {' '}
                    *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    placeholder="jean.dupont@ecole.com"
                  />
                </div>
              </div>

              <div className="
                grid gap-6
                md:grid-cols-2
              "
              >
                <div className="space-y-2">
                  <Label htmlFor="phone">{t.demoRequest.form.phone()}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    placeholder="+221 33 123 45 67"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolName">
                    {t.demoRequest.form.schoolName()}
                    {' '}
                    *
                  </Label>
                  <Input
                    id="schoolName"
                    type="text"
                    required
                    value={formData.schoolName}
                    onChange={e => handleInputChange('schoolName', e.target.value)}
                    placeholder="Excellence Academy"
                  />
                </div>
              </div>

              <div className="
                grid gap-6
                md:grid-cols-2
              "
              >
                <div className="space-y-2">
                  <Label htmlFor="schoolType">
                    {t.demoRequest.form.schoolType()}
                    {' '}
                    *
                  </Label>
                  <Select value={formData.schoolType} onValueChange={value => value && handleInputChange('schoolType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.demoRequest.form.schoolType()}>
                        {formData.schoolType === 'primary' && t.demoRequest.schoolTypes.primary()}
                        {formData.schoolType === 'secondary' && t.demoRequest.schoolTypes.secondary()}
                        {formData.schoolType === 'higher-education' && t.demoRequest.schoolTypes.higherEducation()}
                        {formData.schoolType === 'vocational' && t.demoRequest.schoolTypes.vocational()}
                        {formData.schoolType === 'other' && t.demoRequest.schoolTypes.other()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">{t.demoRequest.schoolTypes.primary()}</SelectItem>
                      <SelectItem value="secondary">{t.demoRequest.schoolTypes.secondary()}</SelectItem>
                      <SelectItem value="higher-education">{t.demoRequest.schoolTypes.higherEducation()}</SelectItem>
                      <SelectItem value="vocational">{t.demoRequest.schoolTypes.vocational()}</SelectItem>
                      <SelectItem value="other">{t.demoRequest.schoolTypes.other()}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">
                    {t.demoRequest.form.role()}
                    {' '}
                    *
                  </Label>
                  <Select value={formData.role} onValueChange={value => value && handleInputChange('role', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.demoRequest.form.role()}>
                        {formData.role === 'principal' && t.demoRequest.roles.principal()}
                        {formData.role === 'vice-principal' && t.demoRequest.roles.vicePrincipal()}
                        {formData.role === 'administrator' && t.demoRequest.roles.administrator()}
                        {formData.role === 'teacher' && t.demoRequest.roles.teacher()}
                        {formData.role === 'it-director' && t.demoRequest.roles.itDirector()}
                        {formData.role === 'parent' && t.demoRequest.roles.parent()}
                        {formData.role === 'other' && t.demoRequest.roles.other()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="principal">{t.demoRequest.roles.principal()}</SelectItem>
                      <SelectItem value="vice-principal">{t.demoRequest.roles.vicePrincipal()}</SelectItem>
                      <SelectItem value="administrator">{t.demoRequest.roles.administrator()}</SelectItem>
                      <SelectItem value="teacher">{t.demoRequest.roles.teacher()}</SelectItem>
                      <SelectItem value="it-director">{t.demoRequest.roles.itDirector()}</SelectItem>
                      <SelectItem value="parent">{t.demoRequest.roles.parent()}</SelectItem>
                      <SelectItem value="other">{t.demoRequest.roles.other()}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentsCount">
                  {t.demoRequest.form.studentsCount()}
                  {' '}
                  *
                </Label>
                <Select value={formData.studentsCount} onValueChange={value => value && handleInputChange('studentsCount', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.demoRequest.form.studentsCount()}>
                      {formData.studentsCount === '0-100' && t.demoRequest.studentsCount['0-100']()}
                      {formData.studentsCount === '100-500' && t.demoRequest.studentsCount['100-500']()}
                      {formData.studentsCount === '500-1000' && t.demoRequest.studentsCount['500-1000']()}
                      {formData.studentsCount === '1000-2000' && t.demoRequest.studentsCount['1000-2000']()}
                      {formData.studentsCount === '2000-5000' && t.demoRequest.studentsCount['2000-5000']()}
                      {formData.studentsCount === '5000+' && t.demoRequest.studentsCount['5000+']()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-100">{t.demoRequest.studentsCount['0-100']()}</SelectItem>
                    <SelectItem value="100-500">{t.demoRequest.studentsCount['100-500']()}</SelectItem>
                    <SelectItem value="500-1000">{t.demoRequest.studentsCount['500-1000']()}</SelectItem>
                    <SelectItem value="1000-2000">{t.demoRequest.studentsCount['1000-2000']()}</SelectItem>
                    <SelectItem value="2000-5000">{t.demoRequest.studentsCount['2000-5000']()}</SelectItem>
                    <SelectItem value="5000+">{t.demoRequest.studentsCount['5000+']()}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">{t.demoRequest.form.message()}</Label>
                <Textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={e => handleInputChange('message', e.target.value)}
                  placeholder="..."
                />
              </div>

              <Alert>
                <AlertDescription>
                  <strong>{t.demoRequest.form.whatNext()}</strong>
                  {' '}
                  {t.demoRequest.form.whatNextDescription()}
                </AlertDescription>
              </Alert>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? t.common.loading() : t.demoRequest.form.submit()}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
