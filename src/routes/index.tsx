import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera, Search, ShieldCheck } from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  return (
    <div className="min-h-screen bg-muted/30 text-foreground font-sans">
      <PublicNav />
      <header className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row md:items-center md:justify-between gap-12">
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            Find your race photos <span className="text-primary">instantly</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            The AI-powered platform for the <i>pelari kalcer</i> community. Upload a selfie, match
            your face, and claim your race moments securely.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/dashboard">
              <Button size="lg" className="w-full sm:w-auto text-base px-8">
                Find My Photos
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8">
                Become a Creator
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex-1 flex justify-center md:justify-end w-full">
          <Card className="w-full max-w-md shadow-xl border-slate-200/60 bg-background/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Camera className="h-6 w-6 text-primary" />
                <span>Live Event Coverage</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-primary/5 p-4 border border-primary/10">
                <div className="flex items-start gap-3">
                  <Search className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium text-foreground">Smart Face Matching</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Our AI scans thousands of event photos to find you in seconds.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 border border-border/50">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <h3 className="font-medium text-foreground">Secure & Private</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your biometrics are encrypted. Unclaimed photos are automatically deleted
                      after 30 days.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>
    </div>
  );
}
