import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, FileX, Clock, MessageCircleX } from "lucide-react";

const painPoints = [
  {
    icon: FileX,
    title: "Manual Paper-Based Processes",
    description: "Tired of managing grades, attendance, and reports with spreadsheets and paper? Automate everything.",
    solution: "Digital-first platform with automated workflows",
  },
  {
    icon: MessageCircleX,
    title: "Poor Parent Communication",
    description: "Parents constantly asking for updates? Struggling to keep them informed about their children's progress?",
    solution: "Built-in messaging and real-time notifications",
  },
  {
    icon: Clock,
    title: "Time-Consuming Administration",
    description: "Spending hours on report cards, fee tracking, and curriculum management instead of focusing on education?",
    solution: "Automated reports and streamlined processes",
  },
];

export function PainPointsSection() {
  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Common School Management Challenges
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We understand your struggles. Here's how Yeko solves them.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {painPoints.map((point) => {
            const IconComponent = point.icon;
            return (
              <Card key={point.title} className="relative overflow-hidden border-2">
                <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full -mr-16 -mt-16" />
                <CardContent className="p-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10 mb-6">
                    <IconComponent className="h-7 w-7 text-destructive" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{point.title}</h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">{point.description}</p>
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-primary">✓ {point.solution}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
