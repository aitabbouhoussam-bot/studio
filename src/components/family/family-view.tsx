
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Copy, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


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
  
  const copyInviteCode = () => {
    navigator.clipboard.writeText(family.inviteCode);
    toast({
        title: "Copied!",
        description: "Invite code has been copied to your clipboard.",
    });
  }

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
                <CardTitle className="font-headline">Members ({family.members.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {family.members.map(member => (
                    <div key={member.uid} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={member.photoURL} alt={member.displayName} />
                                <AvatarFallback>{member.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{member.displayName}</p>
                                <p className="text-sm text-muted-foreground">uid: {member.uid}</p>
                            </div>
                        </div>
                        <Badge variant={member.role === 'owner' ? 'default' : 'secondary'} className="capitalize">
                            {member.role}
                        </Badge>
                    </div>
                ))}
            </CardContent>
        </Card>
    </div>
  );
}
