import { IconCircleCheck } from '@tabler/icons-react'
import { Badge } from '@workspace/ui/components/badge'
import { buttonVariants } from '@workspace/ui/components/button'

export function CoursePromoSection() {
  return (
    <section className="py-24 sm:py-32 bg-linear-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/1-dXh8J08UI?si=aSyQCYk1YVJAlG7X"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              sandbox="allow-scripts allow-popups allow-forms allow-presentation"
            />
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-12 text-center">
          <Badge className="mb-4" variant="secondary">
            9 Modules • 11 Hours • 58 Video Lessons
          </Badge>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Full-Stack Yeko Development for Education
          </h2>

          <p className="text-lg text-muted-foreground mb-8">
            Build comprehensive EdTech platforms that transform education
            management. Learn to create tools for administration, teachers, and
            parents with modern technology and African educational system
            integration.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8 text-left">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg mb-2">What You'll Build</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <IconCircleCheck className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">
                    SmartLinks - Complete short link service
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <IconCircleCheck className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">
                    Location-based intelligent redirects
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <IconCircleCheck className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">AI-powered link analysis</span>
                </div>
                <div className="flex items-start gap-2">
                  <IconCircleCheck className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">Real-time analytics dashboard</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg mb-2">
                Key Platform Features
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <IconCircleCheck className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">
                    Enterprise-grade Scalability & Storage
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <IconCircleCheck className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">
                    Real-time Collaboration Engine
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <IconCircleCheck className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">
                    Secure Authentication & Payments
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <IconCircleCheck className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-sm">
                    Modern, High-Performance Architecture
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              className={buttonVariants({ size: 'lg' })}
              href="https://learn.yeko.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Start Learning Now
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
