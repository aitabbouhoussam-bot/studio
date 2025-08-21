
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

const tiers = [
  {
    name: "Free",
    price: "$0",
    frequency: "/month",
    description: "Get started with the basics.",
    features: [
      "5 AI meal generations per month",
      "Standard shopping lists",
      "Basic recipe saving",
    ],
    cta: "Get Started",
    href: "/signup",
    variant: "outline" as const,
  },
  {
    name: "Premium",
    price: "$5.99",
    frequency: "/month",
    description: "Unlock the full power of Feastly.",
    features: [
      "Unlimited AI meal plan generations",
      "Advanced dietary options",
      "Family collaboration & sharing",
      "Advanced meal insights",
      "Priority support",
    ],
    cta: "Start Free Trial",
    href: "/signup",
    variant: "default" as const,
  },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Find the perfect plan
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose the plan that fits your lifestyle and start your journey to effortless, healthy eating.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 pt-12 md:grid-cols-2">
              {tiers.map((tier) => (
                <Card key={tier.name} className={`flex flex-col ${tier.variant === 'default' ? 'border-primary shadow-lg' : ''}`}>
                   {tier.variant === 'default' && (
                      <div className="py-2 px-4 bg-primary text-primary-foreground text-center text-sm font-semibold rounded-t-lg">
                        Most Popular
                      </div>
                    )}
                  <CardHeader>
                    <CardTitle className="font-headline">{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                    <div>
                      <span className="text-4xl font-bold">{tier.price}</span>
                      <span className="text-muted-foreground">{tier.frequency}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full" variant={tier.variant}>
                        <Link href={tier.href}>{tier.cta}</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
