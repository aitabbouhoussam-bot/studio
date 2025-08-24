
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
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
  Loader2,
  PanelLeft,
} from "lucide-react";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";


const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/meal-planner", icon: CalendarDays, label: "Meal Plan" },
    { href: "/dashboard/recipes", icon: BookOpen, label: "Recipes" },
    { href: "/dashboard/pantry", icon: Refrigerator, label: "Pantry" },
    { href: "/dashboard/shopping-list", icon: ListTodo, label: "Shopping List" },
    { href: "/dashboard/family", icon: Users, label: "Family" },
];


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile, logout, loading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);


  React.useEffect(() => {
    if (loading) return;

    if (user?.uid === 'admin_user') return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (user && userProfile && !userProfile.onboardingCompleted) {
      if (pathname !== '/onboarding') {
        router.push('/onboarding');
      }
    } else if (user && userProfile && userProfile.onboardingCompleted) {
      if (pathname === '/onboarding') {
         router.push('/dashboard');
      }
    }
  }, [user, userProfile, loading, router, pathname]);

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === path;
    return pathname.startsWith(path);
  };
  
  if (loading || !user || !userProfile) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <Loader2 className="w-8 h-8 animate-spin text-paprika" />
      </div>
    );
  }
  
  if (user.uid !== 'admin_user' && !userProfile.onboardingCompleted) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen w-full flex bg-background">
        {/* Left Nav Rail */}
        <aside className={`flex flex-col bg-card border-r border-border transition-all duration-200 ${isSidebarCollapsed ? "w-16" : "w-64"}`}>
            <div className={`flex items-center border-b border-border ${isSidebarCollapsed ? 'justify-center h-16' : 'justify-between h-16 px-4'}`}>
                {!isSidebarCollapsed && (
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <Icons.logo className="w-8 h-8 text-primary" />
                        <span className="font-bold text-lg font-lora">MealGenius</span>
                    </Link>
                )}
            </div>

            <nav className="flex-1 flex flex-col gap-1 p-2">
                {navItems.map(item => (
                     <Tooltip key={item.href} delayDuration={0}>
                        <TooltipTrigger asChild>
                           <Link href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-secondary ${isActive(item.href) ? 'bg-secondary text-primary' : ''} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                             <item.icon className="h-5 w-5" />
                            {!isSidebarCollapsed && <span className="font-medium">{item.label}</span>}
                           </Link>
                        </TooltipTrigger>
                         {isSidebarCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                    </Tooltip>
                ))}
            </nav>

             <div className="mt-auto flex flex-col gap-1 p-2">
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                       <Link href="/dashboard/billing" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-secondary ${isActive('/dashboard/billing') ? 'bg-secondary text-primary' : ''} ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                         <CreditCard className="h-5 w-5" />
                        {!isSidebarCollapsed && <span className="font-medium">Billing</span>}
                       </Link>
                    </TooltipTrigger>
                    {isSidebarCollapsed && <TooltipContent side="right">Billing</TooltipContent>}
                </Tooltip>

                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" className={`w-full mt-2 ${isSidebarCollapsed ? 'p-0 h-10 justify-center' : 'justify-start p-2'}`}>
                          <Avatar className="h-8 w-8">
                              <AvatarImage src={userProfile?.photoURL || ''} alt={userProfile?.displayName || 'User'} />
                              <AvatarFallback>{userProfile?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          {!isSidebarCollapsed && (
                            <div className="ml-2 text-left">
                                <p className="font-medium text-sm">{userProfile?.displayName || 'User'}</p>
                            </div>
                          )}
                           {!isSidebarCollapsed && <ChevronDown className="ml-auto h-4 w-4 shrink-0" />}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{userProfile?.displayName || 'User'}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                      </DropdownMenuItem>
                       <DropdownMenuItem asChild>
                          <Link href="/pricing">
                            <Crown className="mr-2 h-4 w-4" />
                            <span>Upgrade</span>
                          </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                       <DropdownMenuItem onClick={logout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
            </div>
        </aside>
        
        {/* Main Content Area */}
        <div className="flex flex-col flex-1">
            <header className="flex items-center h-16 px-6 border-b shrink-0">
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="mr-4">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle sidebar</span>
                </Button>
                <div className="flex-1">
                    {/* Breadcrumbs or Page Title can go here */}
                </div>
                <div className="flex items-center gap-4">
                    {/* Dark mode, high contrast toggles can go here */}
                </div>
            </header>
            <main className="flex-1 p-6 overflow-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Center Column */}
                    <div className="lg:col-span-2">
                        {children}
                    </div>
                    {/* Right Rail */}
                    <aside className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-20 space-y-6">
                            <div className="p-4 rounded-lg bg-card border">
                                <h3 className="font-lora text-lg font-semibold">Right Rail</h3>
                                <p className="text-sm text-muted-foreground">Dynamic content will appear here.</p>
                            </div>
                             <div className="p-4 rounded-lg bg-card border">
                                <h3 className="font-lora text-lg font-semibold">Another Panel</h3>
                                <p className="text-sm text-muted-foreground">Like shopping list or pantry insights.</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
