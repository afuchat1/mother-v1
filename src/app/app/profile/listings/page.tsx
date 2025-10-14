'use client';
import { products } from "@/lib/data";
import ProductCard from "@/components/mall/product-card";
import ProfilePageHeader from "@/components/profile-page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function MyListingsPage() {
    // For this demo, we'll just show all products as if they are the current user's.
    const userProducts = products; 

    return (
        <main className="h-full flex flex-col bg-secondary">
            <ProfilePageHeader title="My Listings" />
            <div className="flex-1 overflow-y-auto p-4">
                {userProducts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {userProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full items-center justify-center text-center p-8">
                        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                        <h2 className="text-2xl font-bold font-headline mb-2">No listings yet</h2>
                        <p className="text-muted-foreground mb-6">You haven't listed any products for sale.</p>
                        <Button asChild>
                            <Link href="/app/mall">List a Product</Link>
                        </Button>
                    </div>
                )}
            </div>
        </main>
    );
}
