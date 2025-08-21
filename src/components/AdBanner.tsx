
"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "./ui/button";

export function AdBanner() {
  return (
    <Card className="drop-shadow-custom-md border-primary/50">
      <CardContent className="p-4 flex flex-col items-center text-center gap-4">
        <Image
          src="https://placehold.co/300x250.png"
          alt="Advertisement"
          width={300}
          height={250}
          className="rounded-md"
          data-ai-hint="advertisement banner"
        />
        <div>
            <p className="text-sm font-bold">Your Next Favorite Plugin is Here!</p>
            <p className="text-xs text-muted-foreground">
                Get the best tools for your studio. Click to learn more.
            </p>
        </div>
        <Button variant="outline" size="sm" asChild>
            <a href="#" target="_blank" rel="noopener noreferrer">Shop Now</a>
        </Button>
      </CardContent>
    </Card>
  );
}
