import type { ApiResponse, Product } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";

interface ResultsDisplayProps {
  results: ApiResponse | null;
  isLoading: boolean;
}

const ProductCard = ({ product }: { product: Product }) => (
  <Card className="overflow-hidden bg-gray-900/50 border-gray-800 flex flex-col">
    <CardHeader className="p-0">
      <img 
        src={product.image_url} 
        alt={product.name} 
        className="w-full h-64 object-cover object-center"
        onError={(e) => {
          // Fallback image in case the original fails to load
          const target = e.target as HTMLImageElement;
          target.onerror = null; 
          target.src='[https://placehold.co/400x600/222/FFF?text=Image+Not+Found](https://placehold.co/400x600/222/FFF?text=Image+Not+Found)';
        }}
      />
    </CardHeader>
    <CardContent className="p-4 flex-grow">
      <p className="text-sm font-medium text-gray-400">{product.brand}</p>
      <CardTitle className="text-lg font-semibold mt-1 leading-tight">{product.name}</CardTitle>
    </CardContent>
    <CardFooter className="p-4 pt-0 flex justify-between items-center">
      <p className="text-xl font-bold">${product.price}</p>
      <Button asChild variant="outline" size="sm">
        <a href={product.product_url} target="_blank" rel="noopener noreferrer">
          Visit Store <ExternalLink className="w-4 h-4 ml-2" />
        </a>
      </Button>
    </CardFooter>
  </Card>
);

export function ResultsDisplay({ results, isLoading }: ResultsDisplayProps) {
  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <Skeleton className="h-[256px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-8 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!results) {
    return null; // Don't show anything if there are no results or loading state
  }

  if (Object.keys(results).length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">No Matches Found</h2>
        <p className="text-muted-foreground">Our scouts couldn't find any similar items. Try a different photo for better results.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {Object.entries(results).map(([category, products]) => (
        <section key={category}>
          <h2 className="text-3xl font-bold tracking-tight capitalize mb-6 border-l-4 border-primary pl-4">
            Matches for: {category}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
