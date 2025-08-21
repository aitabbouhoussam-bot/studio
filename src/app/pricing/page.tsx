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
      "1 meal plan generation per week",
      "Basic dietary preferences",
      "Standard shopping list",
    ],
    cta: "Get Started",
    href: "/signup",
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "$9",
    frequency: "/month",
    description: "Unlock the full power of MealGenius.",
    features: [
      "Unlimited meal plan generations",
      "Advanced dietary options (Keto, Paleo, etc.)",
      "Smart, categorized shopping lists",
      "Save and track favorite meals",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    href: "/signup",
    variant: "default" as const,
  },
    {
    name: "Family",
    price: "$15",
    frequency: "/month",
    description: "Meal planning for the whole family.",
    features: [
        "All Pro features",
        "Up to 4 family member profiles",
        "Combined family shopping lists",
        "Kid-friendly recipe options",
    ],
    cta: "Choose Family Plan",
    href: "/signup",
    variant: "outline" as const,
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
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 pt-12 sm:grid-cols-2 lg:grid-cols-3">
              {tiers.map((tier) => (
                <Card key={tier.name} className={`flex flex-col ${tier.variant === 'default' ? 'border-primary shadow-lg' : ''}`}>
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
