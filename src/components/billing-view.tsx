
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download } from "lucide-react";
import Link from "next/link";

// Mock data for demonstration
const mockInvoices = [
  {
    invoice: "INV001",
    date: "2023-10-01",
    amount: "$5.99",
    status: "Paid",
  },
  {
    invoice: "INV002",
    date: "2023-11-01",
    amount: "$5.99",
    status: "Paid",
  },
  {
    invoice: "INV003",
    date: "2023-12-01",
    amount: "$5.99",
    status: "Paid",
  },
];

const mockPaymentMethod = {
    cardType: "Visa",
    last4: "4242",
    expires: "08/26"
}

// In a real app, this would come from the user's auth state/database
const mockUserSubscription = {
    tier: "Premium",
    price: 5.99,
    currency: "USD",
    nextBillingDate: "2024-08-01",
}


export function BillingView() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            Billing & Subscription
          </CardTitle>
          <CardDescription>
            Manage your plan, payment methods, and view your invoice history.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2">Current Plan</h3>
                <div className="flex items-center justify-between rounded-md border p-4">
                    <div>
                        <p className="font-medium">Feastly {mockUserSubscription.tier}</p>
                        <p className="text-sm text-muted-foreground">Next payment of ${mockUserSubscription.price} on {mockUserSubscription.nextBillingDate}</p>
                    </div>
                    <Button variant="outline" asChild>
                      <Link href="/pricing">Manage Subscription</Link>
                    </Button>
                </div>
            </div>
             <div>
                <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
                <div className="flex items-center justify-between rounded-md border p-4">
                    <div className="flex items-center gap-4">
                        <CreditCard className="h-8 w-8 text-muted-foreground" />
                        <div>
                             <p className="font-medium">{mockPaymentMethod.cardType} ending in {mockPaymentMethod.last4}</p>
                            <p className="text-sm text-muted-foreground">Expires {mockPaymentMethod.expires}</p>
                        </div>
                    </div>
                    {/* This would link to the Stripe Customer Portal */}
                    <Button variant="outline">Update Payment</Button>
                </div>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((invoice) => (
                <TableRow key={invoice.invoice}>
                  <TableCell className="font-medium">{invoice.invoice}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === 'Paid' ? 'secondary' : 'destructive'}>{invoice.status}</Badge>
                  </TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" disabled>
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
