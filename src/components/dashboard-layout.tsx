
"use client";

import * as React from "react";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  Settings,
  ListTodo,
  Crown,
  LogOut,
  ChevronDown,
  Users,
  BookOpen,
  LayoutDashboard,
  CalendarDays,
  CreditCard,
  Refrigerator,
  Sparkles,
} from "lucide-react";
import { Icons } from "./icons";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { usePathname } from "next/navigation";
import { AiChefAssistant } from "./dashboard/ai-chef-assistant";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAssistantOpen, setIsAssistantOpen] = React.useState(false);

  const isActive = (path: string) => {
    // Exact match for dashboard, startsWith for others
    if (path === "/dashboard") return pathname === path;
    return pathname.startsWith(path);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Icons.logo className="w-8 h-8 text-primary" />
            <span className="font-bold text-lg font-headline group-data-[collapsible=icon]:hidden">
              Feastly
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                href="/dashboard"
                asChild
                isActive={isActive("/dashboard")}
                tooltip="Dashboard"
              >
                <Link href="/dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                href="/dashboard/meal-planner"
                asChild
                isActive={isActive("/dashboard/meal-planner")}
                tooltip="Meal Planner"
              >
                <Link href="/dashboard/meal-planner">
                  <CalendarDays />
                  <span>Meal Planner</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                href="/dashboard/recipes"
                asChild
                isActive={isActive("/dashboard/recipes")}
                tooltip="Recipes"
              >
                <Link href="/dashboard/recipes">
                  <BookOpen />
                  <span>Recipes</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                href="/dashboard/pantry"
                asChild
                isActive={isActive("/dashboard/pantry")}
                tooltip="Pantry"
              >
                <Link href="/dashboard/pantry">
                  <Refrigerator />
                  <span>Pantry</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                href="/dashboard/shopping-list"
                asChild
                isActive={isActive("/dashboard/shopping-list")}
                tooltip="Shopping List"
              >
                <Link href="/dashboard/shopping-list">
                  <ListTodo />
                  <span>Shopping List</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                href="/dashboard/family"
                asChild
                isActive={isActive("/dashboard/family")}
                tooltip="Family"
              >
                <Link href="/dashboard/family">
                  <Users />
                  <span>Family</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                href="/dashboard/billing"
                asChild
                isActive={isActive("/dashboard/billing")}
                tooltip="Billing"
              >
                <Link href="/dashboard/billing">
                  <CreditCard />
                  <span>Billing</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton
                href="/pricing"
                asChild
                isActive={isActive("/pricing")}
                tooltip="Upgrade"
                className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
              >
                <Link href="/pricing">
                  <Crown />
                  <span>Upgrade to Pro</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="justify-start w-full group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:h-10 p-2">
                  <Avatar className="h-8 w-8">
                      <AvatarImage src="https://placehold.co/40x40.png" alt="User" />
                      <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="ml-2 text-left group-data-[collapsible=icon]:hidden">
                      <p className="font-medium text-sm">User</p>
                      <p className="text-xs text-muted-foreground">user@example.com</p>
                  </div>
                   <ChevronDown className="ml-auto h-4 w-4 shrink-0 group-data-[collapsible=icon]:hidden" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">User</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    user@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
              </DropdownMenuItem>
               <DropdownMenuItem asChild>
                  <Link href="/dashboard/billing">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </Link>
                </DropdownMenuItem>
              <DropdownMenuItem asChild>
                  <Link href="/pricing">
                    <Crown className="mr-2 h-4 w-4" />
                    <span>Upgrade</span>
                  </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
               <DropdownMenuItem asChild>
                  <Link href="/">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between p-4 border-b">
          <SidebarTrigger />
          <h1 className="text-xl font-semibold font-headline capitalize">
            {pathname.split("/").pop()?.replace("-", " ") || "Dashboard"}
          </h1>
          <div>
            <Button variant="outline" size="sm" onClick={() => setIsAssistantOpen(true)}>
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              AI Chef Assistant
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
      <AiChefAssistant isOpen={isAssistantOpen} onOpenChange={setIsAssistantOpen} />
    </SidebarProvider>
  );
}
