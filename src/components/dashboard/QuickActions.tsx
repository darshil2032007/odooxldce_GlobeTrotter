import { Link } from "react-router-dom";
import { PlusCircle, Map, Wallet, Share2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function QuickActions() {
  const actions = [
    {
      title: "New Trip",
      description: "Start planning",
      icon: PlusCircle,
      href: "/trips/new",
      color: "bg-primary-50 text-primary-600 border-primary-200",
    },
    {
      title: "All Trips",
      description: "View collection",
      icon: Map,
      href: "/trips",
      color: "bg-accent-50 text-accent-600 border-accent-200",
    },
    {
      title: "Budget Overview",
      description: "Track spending",
      icon: Wallet,
      href: "/trips",
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    {
      title: "Share & Invite",
      description: "Collaborate",
      icon: Share2,
      href: "/trips",
      color: "bg-purple-50 text-purple-600 border-purple-200",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {actions.map((action) => (
            <Link
              key={action.title}
              to={action.href}
              className="flex flex-col items-center justify-center rounded-xl border border-surface-200 bg-surface-50 p-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-surface-300 hover:bg-white hover:shadow-card group"
            >
              <div className={`mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl border ${action.color} transition-transform group-hover:scale-110`}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-surface-800">{action.title}</span>
              <span className="text-xs text-surface-400 mt-0.5">{action.description}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
