
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Copy, Users, MoreHorizontal, UserCog, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";


interface FamilyMember {
    uid: string;
    displayName: string;
    role: 'owner' | 'admin' | 'member';
    photoURL?: string;
}

interface FamilyViewProps {
  family: {
    id: string;
    name: string;
    inviteCode: string;
    members: FamilyMember[];
  };
}

export function FamilyView({ family }: FamilyViewProps) {
  const { toast } = useToast();
  const [members, setMembers] = useState(family.members);

  const copyInviteCode = () => {
    navigator.clipboard.writeText(family.inviteCode);
    toast({
        title: "Copied!",
        description: "Invite code has been copied to your clipboard.",
    });
  }

  const handleRemoveMember = (uid: string) => {
    // This is a mock function. In a real app, this would call a server action.
    console.log(`Removing member with uid: ${uid}`);
    setMembers(currentMembers => currentMembers.filter(m => m.uid !== uid));
    toast({
        title: "Member Removed",
        description: "The family member has been removed successfully.",
    });
  }
  
  // Assuming the current user is the owner for demo purposes
  const isOwner = true; 

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    {family.name}
                </CardTitle>
                <CardDescription>
                    Manage your family members and settings.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 rounded-md border p-4">
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                        Invite Code
                        </p>
                        <p className="text-sm text-muted-foreground">
                        Share this code with others to let them join your family.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-semibold">{family.inviteCode}</span>
                        <Button variant="ghost" size="icon" onClick={copyInviteCode}>
                            <Copy className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Members ({members.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
                {members.map(member => (
                    <div key={member.uid} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50">
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={member.photoURL} alt={member.displayName} />
                                <AvatarFallback>{member.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{member.displayName} {member.role === 'owner' ? '(You)' : ''}</p>
                                <p className="text-sm text-muted-foreground">uid: {member.uid}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={member.role === 'owner' ? 'default' : 'secondary'} className="capitalize">
                                {member.role}
                            </Badge>
                            {isOwner && member.role !== 'owner' && (
                                 <AlertDialog>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem disabled>
                                                <UserCog className="mr-2 h-4 w-4" />
                                                <span>Change Role</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Remove</span>
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently remove {member.displayName} from the family.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleRemoveMember(member.uid)} className="bg-destructive hover:bg-destructive/90">
                                            Yes, remove member
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    </div>
  );
}
