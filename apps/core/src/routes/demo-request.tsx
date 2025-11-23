import type { FormEvent } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export const Route = createFileRoute('/demo-request')({
  component: DemoRequest,
})

function DemoRequest() {
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
      <div className="min-h-screen bg-linear-to-b from-background to-muted/20 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          <Card className="text-center">
            <CardContent className="pt-6">
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <CardTitle className="mb-2">Demo Request Received!</CardTitle>
              <CardDescription className="text-lg mb-6">
                Thank you for your interest in Yeko! Our team will contact you within 24 hours to schedule your personalized demo.
              </CardDescription>
              <p className="text-muted-foreground mb-6">
                We've sent a confirmation email to
                {' '}
                {formData.email}
              </p>
              <div className="flex gap-4 justify-center">
                <Link to="/">
                  <Button variant="outline">Return Home</Button>
                </Link>
                <Button onClick={() => window.location.href = 'mailto:demo@yeko.com'}>
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Request a Demo</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how Yeko can transform your educational institution. Schedule a personalized demo with our team.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Demo Request Form</CardTitle>
            <CardDescription>
              Please fill in your information and we'll get back to you within 24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    placeholder="john.doe@school.edu"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={e => handleInputChange('phone', e.target.value)}
                    placeholder="+221 33 123 45 67"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolName">School/Organization Name *</Label>
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

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="schoolType">School Type *</Label>
                  <Select value={formData.schoolType} onValueChange={(value: string) => handleInputChange('schoolType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select school type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary School</SelectItem>
                      <SelectItem value="secondary">Secondary School</SelectItem>
                      <SelectItem value="higher-education">Higher Education</SelectItem>
                      <SelectItem value="vocational">Vocational Training</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Your Role *</Label>
                  <Select value={formData.role} onValueChange={(value: string) => handleInputChange('role', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="principal">Principal</SelectItem>
                      <SelectItem value="vice-principal">Vice Principal</SelectItem>
                      <SelectItem value="administrator">Administrator</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="it-director">IT Director</SelectItem>
                      <SelectItem value="parent">Parent Association</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentsCount">Number of Students *</Label>
                <Select value={formData.studentsCount} onValueChange={(value: string) => handleInputChange('studentsCount', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student count range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-100">Less than 100</SelectItem>
                    <SelectItem value="100-500">100-500</SelectItem>
                    <SelectItem value="500-1000">500-1,000</SelectItem>
                    <SelectItem value="1000-2000">1,000-2,000</SelectItem>
                    <SelectItem value="2000-5000">2,000-5,000</SelectItem>
                    <SelectItem value="5000+">More than 5,000</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Additional Information</Label>
                <Textarea
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={e => handleInputChange('message', e.target.value)}
                  placeholder="Tell us about your specific needs, current challenges, or what features you're most interested in..."
                />
              </div>

              <Alert>
                <AlertDescription>
                  <strong>What happens next?</strong>
                  {' '}
                  Our team will review your request and contact you within 24 hours to schedule a personalized demo tailored to your institution's needs.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? 'Submitting...' : 'Request Demo'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
