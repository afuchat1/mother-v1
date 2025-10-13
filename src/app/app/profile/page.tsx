import { currentUser } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfilePage() {
  return (
    <main className="flex-1 bg-secondary">
      <div className="p-4 md:p-6">
        <div className="flex flex-col items-center gap-4 mb-6">
            <Avatar className="h-24 w-24">
                <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                <AvatarFallback>
                    {currentUser.name.charAt(0)}
                </AvatarFallback>
            </Avatar>
            <h1 className="text-3xl font-bold font-headline">{currentUser.name}</h1>
        </div>
         <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Profile page content coming soon!</p>
        </div>
      </div>
    </main>
  );
}
