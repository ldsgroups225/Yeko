import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  BookOpenIcon,
  DatabaseIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  Bot,
  Sparkles,
  CheckCircle,
} from "lucide-react";

export const Route = createFileRoute("/_static/docs/")({
  component: RouteComponent,
});

const gettingStartedSteps = [
  {
    name: "database",
    title: "Database Setup",
    description:
      "Configure your serverless database with edge optimization and HTTP proxying to prevent connection overwhelm in isolated environments.",
    icon: DatabaseIcon,
    image: "/cloudflare.png",
    badgeVariant: "default" as const,
    features: [
      "Edge Optimized",
      "Connection Pooling",
      "HTTP Proxy",
      "Serverless Ready",
    ],
  },
  {
    name: "authentication",
    title: "Authentication Setup",
    description:
      "Set up comprehensive authentication with Better Auth, including social providers, email/password, and session management for serverless environments.",
    icon: ShieldCheckIcon,
    image: "/better-auth.png",
    badgeVariant: "secondary" as const,
    features: [
      "Social OAuth",
      "Session Management",
      "Database Agnostic",
      "Edge Compatible",
    ],
  },
  {
    name: "polar",
    title: "Payment Integration",
    description:
      "Integrate Polar for modern subscription management and payment processing without webhooks or external database tables.",
    icon: CreditCardIcon,
    image: "/polar.png",
    badgeVariant: "outline" as const,
    features: [
      "Subscription Management",
      "No Webhooks",
      "Developer Focused",
      "API Integration",
    ],
  },
];

function RouteComponent() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <BookOpenIcon className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Documentation
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
          Learn how to set up and use your Yeko school management platform.
          Guides for administrators, teachers, and parents to get the most out
          of your educational ecosystem.
        </p>
        <Badge variant="secondary" className="text-sm">
          School Management Platform
        </Badge>
      </div>

      {/* Quick Start Banner */}
      <div className="mb-12">
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">
                Get Started in Minutes
              </h3>
              <p className="text-muted-foreground">
                Set up your school, add users, and start managing your educational institution
                with our comprehensive platform.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Section */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Getting Started Guide
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Follow these steps in order to set up your Yeko EdTech platform. Each
            step builds on the previous one.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {gettingStartedSteps.map((step) => {
            const IconComponent = step.icon;

            return (
              <Card
                key={step.name}
                className="group hover:shadow-lg transition-all duration-200 h-full"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </div>
                  <div className="flex justify-center mb-4">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="h-16 w-16 object-contain rounded-lg bg-background border p-2"
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="mb-4 leading-relaxed">
                    {step.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {step.features.map((feature) => (
                      <Badge
                        key={feature}
                        variant="secondary"
                        className="text-xs"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Link
                    to="/docs/$name"
                    params={{ name: step.name }}
                    className="block"
                  >
                    <Button className="w-full group-hover:bg-primary/90 transition-colors">
                      Start {step.title}
                      <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Access Section */}
      <Card className="border-dashed bg-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5" />
            Quick Access
          </CardTitle>
          <CardDescription>
            Jump directly to any documentation section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gettingStartedSteps.map((step) => {
              const IconComponent = step.icon;
              return (
                <Link
                  key={step.name}
                  to="/docs/$name"
                  params={{ name: step.name }}
                >
                  <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group border-muted">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-semibold group-hover:text-primary transition-colors">
                          {step.title}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      </div>
  );
}
