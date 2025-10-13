import { Button } from "@/components/ui/button";
import { products } from "@/lib/data";
import ProductCard from "@/components/mall/product-card";
import AddProductDialog from "@/components/mall/add-product-dialog";
import { PlusCircle } from "lucide-react";

export default function MallPage() {
  return (
    <main className="flex-1">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold font-headline">AfuMall</h1>
            <p className="text-muted-foreground">
              Discover products from your community.
            </p>
          </div>
          <AddProductDialog>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> New Product
            </Button>
          </AddProductDialog>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  );
}
