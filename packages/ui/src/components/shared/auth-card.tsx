import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui";
import React from "react";

interface AuthCardProps {
  title: string;
  description: string;
  badge?: string;
  children: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({ title, description, badge, children }) => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border-border shadow-lg bg-card/90 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          {badge && (
            <div className="mx-auto mb-2 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {badge}
            </div>
          )}
          <CardTitle className="text-2xl font-bold tracking-tight">{title}</CardTitle>
          <CardDescription className="text-muted-foreground">{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
};