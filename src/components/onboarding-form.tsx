
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Icons } from "./icons";
import { useToast } from "@/hooks/use-toast";
import { saveOnboardingDataAction } from "@/lib/onboarding-actions";

const dietaryOptions = ['omnivore', 'vegetarian', 'vegan', 'keto', 'paleo', 'gluten-free', 'halal', 'kosher'];
const allergyOptions = ['nuts', 'dairy', 'shellfish', 'eggs', 'soy', 'wheat', 'fish', 'sesame'];


const onboardingSchema = z.object({
  dietaryPreferences: z.array(z.string()).min(1, "Please select at least one dietary preference."),
  familySize: z.object({
    adults: z.coerce.number().min(1, "There must be at least one adult.").default(1),
    kids: z.coerce.number().min(0).default(0),
  }),
  allergies: z.array(z.string()).default([]),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export function OnboardingForm() {
    const [step, setStep] = useState(1);
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<OnboardingFormValues>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            dietaryPreferences: ["omnivore"],
            familySize: { adults: 1, kids: 0 },
            allergies: [],
        },
    });

    const { isSubmitting } = form.formState;

    const totalSteps = 3;
    const progress = (step / totalSteps) * 100;

    const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));
    
    const onSubmit = async (data: OnboardingFormValues) => {
        const result = await saveOnboardingDataAction(data);
        if (result.success) {
            toast({
                title: "Setup Complete!",
                description: "Your preferences have been saved. Welcome to the dashboard!",
            });
            router.push('/dashboard');
        } else {
             toast({
                variant: "destructive",
                title: "Error Saving Preferences",
                description: result.error || "An unknown error occurred.",
            });
        }
    };

    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <Progress value={progress} className="mb-4" />
                <CardTitle className="font-headline text-2xl">Welcome to Feastly!</CardTitle>
                <CardDescription>Let's personalize your experience. Complete these {totalSteps} steps.</CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        {step === 1 && (
                             <FormField
                                control={form.control}
                                name="dietaryPreferences"
                                render={() => (
                                    <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">What are your dietary preferences?</FormLabel>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {dietaryOptions.map((item) => (
                                        <FormField
                                        key={item}
                                        control={form.control}
                                        name="dietaryPreferences"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(item)}
                                                    onCheckedChange={(checked) => {
                                                    return checked
                                                        ? field.onChange([...field.value, item])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                                (value) => value !== item
                                                            )
                                                        )
                                                    }}
                                                />
                                                </FormControl>
                                                <FormLabel className="font-normal capitalize">{item}</FormLabel>
                                            </FormItem>
                                        )}
                                        />
                                    ))}
                                    </div>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                        )}
                         {step === 2 && (
                            <div className="space-y-4">
                                <div>
                                    <FormLabel className="text-base">Tell us about your family size.</FormLabel>
                                </div>
                                <div className="flex gap-4">
                                    <FormField
                                    control={form.control}
                                    name="familySize.adults"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Adults</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                    <FormField
                                    control={form.control}
                                    name="familySize.kids"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Kids</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="0" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                </div>
                            </div>
                        )}
                        {step === 3 && (
                             <FormField
                                control={form.control}
                                name="allergies"
                                render={() => (
                                    <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">Do you have any allergies?</FormLabel>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {allergyOptions.map((item) => (
                                        <FormField
                                        key={item}
                                        control={form.control}
                                        name="allergies"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(item)}
                                                    onCheckedChange={(checked) => {
                                                    return checked
                                                        ? field.onChange([...field.value, item])
                                                        : field.onChange(
                                                            field.value?.filter(
                                                                (value) => value !== item
                                                            )
                                                        )
                                                    }}
                                                />
                                                </FormControl>
                                                <FormLabel className="font-normal capitalize">{item}</FormLabel>
                                            </FormItem>
                                        )}
                                        />
                                    ))}
                                    </div>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                        )}

                    </CardContent>
                    <CardFooter className="flex justify-between">
                        {step > 1 ? (
                            <Button type="button" variant="outline" onClick={prevStep}>
                                Previous
                            </Button>
                        ) : <div />}

                        {step < totalSteps ? (
                            <Button type="button" onClick={nextStep}>
                                Next
                            </Button>
                        ) : (
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                                Finish Setup
                            </Button>
                        )}
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}
