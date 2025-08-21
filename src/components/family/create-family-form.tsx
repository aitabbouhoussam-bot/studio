
"use client";

import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Icons } from "../icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const createFamilySchema = z.object({
  familyName: z.string().min(2, {
    message: "Family name must be at least 2 characters.",
  }),
});

const joinFamilySchema = z.object({
    inviteCode: z.string().min(5, {
        message: "Invite code must be at least 5 characters.",
    }),
});

interface CreateFamilyFormProps {
  onCreate: (name: string) => Promise<void>;
  onJoin: (code: string) => Promise<void>;
  isLoading: boolean;
}

export function CreateFamilyForm({ onCreate, onJoin, isLoading }: CreateFamilyFormProps) {
  const createForm = useForm<z.infer<typeof createFamilySchema>>({
    resolver: zodResolver(createFamilySchema),
    defaultValues: {
      familyName: "",
    },
  });

  const joinForm = useForm<z.infer<typeof joinFamilySchema>>({
    resolver: zodResolver(joinFamilySchema),
    defaultValues: {
        inviteCode: "",
    }
  });


  const handleCreateSubmit = (values: z.infer<typeof createFamilySchema>) => {
    onCreate(values.familyName);
  };

  const handleJoinSubmit = (values: z.infer<typeof joinFamilySchema>) => {
    onJoin(values.inviteCode);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Manage Your Family</CardTitle>
        <CardDescription>
          Create a new family to share meal plans and shopping lists, or join an existing one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">Create Family</TabsTrigger>
                <TabsTrigger value="join">Join Family</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
                 <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-6 pt-6">
                        <FormField
                        control={createForm.control}
                        name="familyName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Family Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., The Smiths" {...field} disabled={isLoading}/>
                            </FormControl>
                            <FormDescription>
                                This name will be visible to all family members.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                            Create Family
                        </Button>
                    </form>
                </Form>
            </TabsContent>
            <TabsContent value="join">
                <Form {...joinForm}>
                    <form onSubmit={joinForm.handleSubmit(handleJoinSubmit)} className="space-y-6 pt-6">
                        <FormField
                        control={joinForm.control}
                        name="inviteCode"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Invite Code</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter the code from a family member" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormDescription>
                                This is a unique code to join an existing family.
                            </FormDescription>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                         <Button type="submit" disabled={isLoading}>
                            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                            Join Family
                        </Button>
                    </form>
                </Form>
            </TabsContent>
        </Tabs>
       
      </CardContent>
    </Card>
  );
}
