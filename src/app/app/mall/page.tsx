'use client';
import { useState } from "react";
import { products as initialProducts, currentUser } from "@/lib/data";
import ProductCard from "@/components/mall/product-card";
import AddProductDialog from "@/components/mall/add-product-dialog";
import { PlusCircle } from "lucide-react";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function MallPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addProduct = (newProductData: Omit<Product, 'id' | 'seller' | 'imageUrl'>) => {
    const newProduct: Product = {
      id: `p${products.length + 1}`,
      ...newProductData,
      imageUrl: 'https://picsum.photos/seed/newproduct/300/200',
      seller: currentUser,
    };
    setProducts(prevProducts => [newProduct, ...prevProducts]);
  };

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
            <AddProductDialog onAddProduct={addProduct}>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> New Product
              </Button>
            </AddProductDialog>
          </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  );
}
