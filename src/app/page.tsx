import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, ListChecks, Users, PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    icon: <Bot className="h-10 w-10 text-primary" />,
    title: "AI-Powered Planning",
    description: "Personalized meal plans tailored to your dietary needs, preferences, and lifestyle, generated in seconds.",
  },
  {
    icon: <ListChecks className="h-10 w-10 text-primary" />,
    title: "Smart Shopping Lists",
    description: "Auto-generated, categorized shopping lists that sync with your meal plan, making grocery trips efficient and waste-free.",
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: "Family Collaboration",
    description: "Share meal plans, shopping lists, and recipes with family members in real-time. (Premium Feature)",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_550px] lg:gap-12 xl:grid-cols-[1fr_650px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Transform Meal Planning with AI
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Generate personalized meal plans and smart shopping lists with real-time family collaboration. Eat better, save time, and reduce food waste.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup">Start Free Trial</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="#">
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Watch Demo
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://placehold.co/650x650.png"
                width="650"
                height="650"
                alt="Hero"
                data-ai-hint="healthy food platter"
                className="mx-auto aspect-square overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                 <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Everything You Need for Effortless Meals
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Feastly combines intelligent planning with seamless collaboration to simplify your life.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-1 md:grid-cols-3 md:gap-12 mt-12">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-card hover:shadow-lg transition-shadow border-none text-center">
                  <CardHeader className="flex flex-col items-center gap-4">
                    {feature.icon}
                    <CardTitle className="text-xl font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
                Ready to transform your meal times?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Sign up today and take the first step towards stress-free, delicious, and healthy eating.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
               <Button asChild size="lg" className="w-full">
                <Link href="/signup">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
                 <h3 className="font-bold text-lg font-headline">Feastly</h3>
                 <p className="text-sm text-muted-foreground">Eat better, together.</p>
            </div>
             <div className="flex flex-col gap-2">
                <h3 className="font-semibold">Product</h3>
                <Link href="#features" className="text-sm text-muted-foreground hover:text-primary">Features</Link>
                <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary">Pricing</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">API</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Mobile App</Link>
            </div>
             <div className="flex flex-col gap-2">
                <h3 className="font-semibold">Company</h3>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">About</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Blog</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Careers</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Contact</Link>
            </div>
             <div className="flex flex-col gap-2">
                <h3 className="font-semibold">Legal</h3>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Cookie Policy</Link>
            </div>
        </div>
         <div className="container px-4 md:px-6 mt-8 text-center text-xs text-muted-foreground">
             &copy; {new Date().getFullYear()} Feastly. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
