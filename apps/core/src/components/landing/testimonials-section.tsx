import { IconStar } from '@tabler/icons-react'
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar'
import { Card, CardContent } from '@workspace/ui/components/card'
import { generateUUID } from '@/utils/generateUUID'

const testimonials = [
  {
    content: 'Yeko has transformed how we manage our school. What used to take days now takes minutes. Parent satisfaction has never been higher.',
    author: 'Dr. Amina Diallo',
    role: 'Principal, Lycée Excellence',
    location: 'Dakar, Senegal',
    avatar: 'AD',
    rating: 5,
  },
  {
    content: 'As a teacher, I love how easy it is to enter grades and communicate with parents. The mobile app is a game-changer for busy educators.',
    author: 'Jean-Paul Kouassi',
    role: 'Mathematics Teacher',
    location: 'Abidjan, Côte d\'Ivoire',
    avatar: 'JK',
    rating: 5,
  },
  {
    content: 'Finally, I can track my children\'s progress in real-time. The transparency and communication have improved dramatically. Highly recommend!',
    author: 'Grace Okonkwo',
    role: 'Parent of 3 Students',
    location: 'Lagos, Nigeria',
    avatar: 'GO',
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="
      py-24
      sm:py-32
    "
    >
      <div className="
        mx-auto max-w-7xl px-6
        lg:px-8
      "
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="
            text-foreground text-3xl font-bold tracking-tight
            sm:text-4xl
          "
          >
            Loved by Schools Across Africa
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            See what educators, parents, and administrators are saying about Yeko
          </p>
        </div>

        <div className="
          mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8
          lg:mx-0 lg:max-w-none lg:grid-cols-3
        "
        >
          {testimonials.map(testimonial => (
            <Card key={testimonial.author} className="border-2">
              <CardContent className="p-8">
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: testimonial.rating }).map(() => (
                    <IconStar
                      key={generateUUID()}
                      className="fill-primary text-primary h-5 w-5"
                    />
                  ))}
                </div>
                <blockquote className="
                  text-muted-foreground mb-6 leading-relaxed
                "
                >
                  "
                  {testimonial.content}
                  "
                </blockquote>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="
                      bg-primary text-primary-foreground
                    "
                    >
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-muted-foreground text-sm">{testimonial.role}</div>
                    <div className="text-muted-foreground text-xs">{testimonial.location}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
