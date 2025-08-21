
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addRecipeAction } from "@/lib/recipe-actions";
import { Icons } from "./icons";
import { PlusCircle, Trash2 } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

const ingredientSchema = z.object({
  name: z.string().min(1, "Ingredient name is required."),
  quantity: z.coerce.number().positive("Quantity must be a positive number."),
  unit: z.string().min(1, "Unit is required."),
});

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  imageUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  ingredients: z.array(ingredientSchema).min(1, "Please add at least one ingredient."),
  instructions: z.string().min(10, "Instructions must be at least 10 characters long."),
  calories: z.coerce.number().positive().optional(),
  protein: z.coerce.number().positive().optional(),
  carbs: z.coerce.number().positive().optional(),
  fat: z.coerce.number().positive().optional(),
});

type RecipeFormValues = z.infer<typeof formSchema>;

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddRecipeModal({ isOpen, onClose }: AddRecipeModalProps) {
  const { toast } = useToast();
  
  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      imageUrl: "",
      ingredients: [{ name: "", quantity: 1, unit: "" }],
      instructions: "",
      calories: undefined,
      protein: undefined,
      carbs: undefined,
      fat: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  const { isSubmitting } = form.formState;

  const handleSubmit = async (values: RecipeFormValues) => {
    const result = await addRecipeAction(values);

    if (result.success) {
      toast({
        title: "Recipe Added!",
        description: `"${values.title}" has been saved to your library.`,
      });
      form.reset();
      onClose();
    } else {
      toast({
        variant: "destructive",
        title: "Error adding recipe",
        description: result.error || "An unknown error occurred.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Add New Recipe</DialogTitle>
          <DialogDescription>
            Fill out the form below to add a new recipe to your personal library.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <ScrollArea className="max-h-[65vh] p-1 pr-6">
              <div className="space-y-6 p-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipe Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Spicy Chicken Tacos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.png" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Ingredients</FormLabel>
                  <div className="space-y-3 mt-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-start">
                        <FormField
                          control={form.control}
                          name={`ingredients.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Ingredient name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`ingredients.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input type="number" placeholder="Qty" className="w-20" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name={`ingredients.${index}.unit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Unit (g, ml, cup)" className="w-28" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => append({ name: "", quantity: 1, unit: "" })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Ingredient
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name="instructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="List the preparation steps..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Nutrition Facts (Optional)</FormLabel>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      <FormField
                          control={form.control}
                          name="calories"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel className="text-sm font-normal">Calories</FormLabel>
                              <FormControl>
                                  <Input type="number" placeholder="e.g., 550" {...field} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                        <FormField
                          control={form.control}
                          name="protein"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel className="text-sm font-normal">Protein (g)</FormLabel>
                              <FormControl>
                                  <Input type="number" placeholder="e.g., 30" {...field} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                        <FormField
                          control={form.control}
                          name="carbs"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel className="text-sm font-normal">Carbs (g)</FormLabel>
                              <FormControl>
                                  <Input type="number" placeholder="e.g., 45" {...field} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                        <FormField
                          control={form.control}
                          name="fat"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel className="text-sm font-normal">Fat (g)</FormLabel>
                              <FormControl>
                                  <Input type="number" placeholder="e.g., 20" {...field} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                   </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="pt-6 pr-6">
                <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                        Cancel
                    </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                    Save Recipe
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
