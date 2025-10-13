import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AfuChatLogo } from "@/components/icons";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight } from "lucide-react";

export default function LoginPage() {
  const loginHeroImage = PlaceHolderImages.find(img => img.id === 'loginHero');

  return (
    <div className="w-full min-h-screen">
      <div className="flex items-center justify-center py-12 h-full">
        <div className="mx-auto grid w-[350px] gap-6">
          <Card className="p-4 sm:p-6 border-0 shadow-none">
            <CardHeader className="text-center">
              <div className="mb-4 flex justify-center">
                <AfuChatLogo className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold font-headline">Welcome to AfuChat</CardTitle>
              <CardDescription>
                Talk, trade, and learn — all in one conversation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <p className="px-4 text-center text-sm text-muted-foreground">
                    This is a demo of the AfuChat MVP.
                </p>
                <Link href="/app/chat">
                  <Button type="submit" className="w-full font-bold">
                    Continue to App <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
