import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Navigation from "@/components/Navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Footer from "./Footer";

interface Product {
  id: number;
  name: string;
  price: string;
}

const Admin = () => {
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: "Aspirin 500mg", price: "12.99" },
    { id: 2, name: "Vitamin C 1000mg", price: "18.50" },
  ]);

  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProductName || !newProductPrice) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const newProduct: Product = {
      id: Date.now(),
      name: newProductName,
      price: newProductPrice,
    };

    setProducts([...products, newProduct]);
    setNewProductName("");
    setNewProductPrice("");

    toast({
      title: "Product added",
      description: `${newProductName} has been added successfully.`,
    });
  };

  const handleDeleteProduct = (id: number, name: string) => {
    setProducts(products.filter((p) => p.id !== id));
    toast({
      title: "Product deleted",
      description: `${name} has been removed.`,
    });
  };

  return (
    <>

      <div className="min-h-screen font-['Montserrat',sans-serif] text-slate-700 flex flex-col">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your pharmacy inventory</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Product Form */}
            <Card className="shadow-md">
              <CardHeader className="bg-secondary/10">
                <CardTitle className="flex items-center gap-2 text-secondary">
                  <Plus className="h-5 w-5" />
                  Add New Product
                </CardTitle>
                <CardDescription>Enter product details to add to inventory</CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Product Name</Label>
                    <Input
                      id="product-name"
                      type="text"
                      placeholder="e.g., Aspirin 500mg"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-price">Price ($)</Label>
                    <Input
                      id="product-price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Product List */}
            <Card className="shadow-md">
              <CardHeader className="bg-primary/10">
                <CardTitle className="text-primary">Current Products</CardTitle>
                <CardDescription>Manage your existing inventory</CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="space-y-3">
                  {products.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No products yet</p>
                  ) : (
                    products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div>
                          <h3 className="font-medium text-foreground">{product.name}</h3>
                          <p className="text-sm text-primary font-semibold">${product.price}</p>
                        </div>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Admin;
