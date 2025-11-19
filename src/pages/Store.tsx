import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { ShoppingCart, Pill } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

const mockProducts: Product[] = [
  { id: 1, name: "Aspirin 500mg", price: 12.99, description: "Pain relief tablets" },
  { id: 2, name: "Vitamin C 1000mg", price: 18.50, description: "Immune support supplement" },
  { id: 3, name: "Bandages Pack", price: 8.99, description: "Adhesive wound care" },
  { id: 4, name: "Cough Syrup", price: 15.75, description: "Soothing relief formula" },
  { id: 5, name: "Hand Sanitizer", price: 6.99, description: "Antibacterial gel 250ml" },
  { id: 6, name: "Thermometer Digital", price: 22.99, description: "Fast accurate readings" },
  { id: 7, name: "Pain Relief Cream", price: 14.50, description: "Topical analgesic" },
  { id: 8, name: "First Aid Kit", price: 35.99, description: "Complete emergency set" },
  { id: 9, name: "Multivitamin", price: 24.99, description: "Daily health supplement" },
];

const Store = () => {
  const [cart, setCart] = useState<number[]>([]);

  const addToCart = (productId: number, productName: string) => {
    setCart([...cart, productId]);
    toast({
      title: "Added to cart",
      description: `${productName} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Pharmacy Store</h1>
          <p className="text-muted-foreground">Browse our selection of quality healthcare products</p>
          {cart.length > 0 && (
            <div className="mt-4 flex items-center gap-2 text-primary">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-medium">{cart.length} item(s) in cart</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProducts.map((product) => (
            <Card key={product.id} className="flex flex-col shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </CardHeader>
              
              <CardContent className="flex-grow">
                <div className="h-32 bg-muted rounded-md flex items-center justify-center mb-4">
                  <Pill className="h-12 w-12 text-primary/40" /> 
                </div>
                <p className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
              </CardContent>
              
              <CardFooter>
                <Button 
                  onClick={() => addToCart(product.id, product.name)}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Store;
