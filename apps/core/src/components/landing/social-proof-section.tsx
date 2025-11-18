import { Users, School, TrendingUp, Award } from "lucide-react";

const stats = [
  { icon: School, value: "200+", label: "Partner Schools" },
  { icon: Users, value: "50K+", label: "Active Students" },
  { icon: TrendingUp, value: "98%", label: "Parent Satisfaction" },
  { icon: Award, value: "15+", label: "Countries" },
];

export function SocialProofSection() {
  return (
    <section className="py-12 border-y bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-8">
          <p className="text-sm font-semibold text-primary">
            Trusted by Educational Institutions Across Africa
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.label} className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
