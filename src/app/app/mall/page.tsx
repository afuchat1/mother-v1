'use client';
import { useContext } from "react";
import { AppContext } from "@/lib/context.tsx";
import ProductCard from "@/components/mall/product-card";
import AddProductDialog from "@/components/mall/add-product-dialog";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Product } from "@/lib/types";
import { useMemoFirebase } from "@/firebase/provider";

export default function MallPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const productsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'afuMallListings');
  }, [firestore]);
  
  const { data: products, isLoading } = useCollection<Product>(productsRef);

  if (isLoading || !user) {
    return <p>Loading...</p>
  }

  return (
    <main className="flex flex-col h-full bg-secondary">
       <header className="p-4 border-b sticky top-0 bg-background z-10 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-headline">AfuMall</h1>
              <p className="text-muted-foreground text-sm">
                Discover products from your community.
              </p>
            </div>
            <AddProductDialog>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> New Product
              </Button>
            </AddProductDialog>
          </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-6">
          {products && products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  );
}
