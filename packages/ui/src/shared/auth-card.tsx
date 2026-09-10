import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui";
import React from "react";
import Image from "next/image";

interface AuthCardProps {
  title: string;
  description: string;
  badge?: string;
  children: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({ title, description, badge, children }) => {
  return (
    <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-md rounded-xl overflow-hidden">
      <CardHeader className="space-y-2 text-center pb-6 pt-8">
        <div className="mx-auto mb-4 flex justify-center">
          <Image
            src="/logo-actual.png"
            alt="PQA Portal"
            width={240}
            height={80}
            className="h-20 w-auto object-contain"
            priority
          />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight text-primary">{title}</CardTitle>
        <CardDescription className="text-sm font-medium text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">{children}</CardContent>
    </Card>
  );
};
