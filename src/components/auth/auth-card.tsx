import type { ReactNode } from "react";

import { Card, CardBody } from "@/components/ui/card";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <Card className="w-full max-w-md shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
      <CardBody>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">{description}</p>
        <div className="mt-8">{children}</div>
      </CardBody>
    </Card>
  );
}
