import React from "react";
import { FileChartColumn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { CreateInvoiceModal } from "@/components/dashboard/create-modal";
import { invoiceStatistics, user } from "@/constants/constants";
import InvoiceTable from "@/components/dashboard/invoice-table";

export default function Dashboard() {
  return (
    <main className="wrapper top min-h-screen bg-gray-50">
      <div className="px-4 py-6 sm:px-0">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your invoices for your business.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Card className="purple-gradient text-white">
            <CardHeader>
              <CardTitle className="text-white">
                Ready to create a new invoice?
              </CardTitle>
              <CardDescription className="text-purple-100">
                Generate professional invoices in minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateInvoiceModal />
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {invoiceStatistics.map((item, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.category}
                </CardTitle>
                <FileChartColumn className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <p className="text-xs text-muted-foreground">{item.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Your latest invoice activity</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <InvoiceTable />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
