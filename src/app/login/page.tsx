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
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <Card className="p-4 sm:p-6">
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
      <div className="hidden bg-muted lg:block">
        {loginHeroImage && (
          <Image
            src={loginHeroImage.imageUrl}
            alt="AfuChat Hero"
            width="1200"
            height="800"
            className="h-full w-full object-cover dark:brightness-[0.3] dark:grayscale"
            data-ai-hint={loginHeroImage.imageHint}
          />
        )}
      </div>
    </div>
  );
}
