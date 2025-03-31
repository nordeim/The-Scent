import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Category, Product } from "@shared/schema";
import { ProductCard } from "@/components/product-card";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, X, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

export default function ShopPage() {
  const [location, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(params.get("category"));
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [sortOrder, setSortOrder] = useState<string>("default");
  const [searchQuery, setSearchQuery] = useState<string>(params.get("query") || "");
  
  // Categories query
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Products query with filters
  // In a real app, we would pass the filters to the API endpoint
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  // Filter products based on URL parameters and state
  const filteredProducts = products?.filter(product => {
    // Filter by category
    if (categoryFilter && product.categoryId !== getIdFromSlug(categoryFilter)) {
      return false;
    }
    
    // Filter by price range
    const price = parseFloat(product.price.toString());
    if (price < priceRange[0] || price > priceRange[1]) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !product.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Sort products
  const sortedProducts = [...(filteredProducts || [])].sort((a, b) => {
    const priceA = parseFloat(a.price.toString());
    const priceB = parseFloat(b.price.toString());
    
    switch (sortOrder) {
      case "price-asc":
        return priceA - priceB;
      case "price-desc":
        return priceB - priceA;
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });
  
  // Get category ID from slug
  function getIdFromSlug(slug: string): number | null {
    const category = categories?.find(cat => cat.slug === slug);
    return category ? category.id : null;
  }
  
  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateURLParams();
  };
  
  // Update URL parameters based on filters
  const updateURLParams = () => {
    const params = new URLSearchParams();
    
    if (categoryFilter) {
      params.set("category", categoryFilter);
    }
    
    if (searchQuery) {
      params.set("query", searchQuery);
    }
    
    const newLocation = `/shop${params.toString() ? `?${params.toString()}` : ''}`;
    setLocation(newLocation);
  };
  
  // Apply filters
  const applyFilters = () => {
    updateURLParams();
    setMobileFiltersOpen(false);
  };
  
  // Reset filters
  const resetFilters = () => {
    setCategoryFilter(null);
    setPriceRange([0, 100]);
    setSortOrder("default");
    setSearchQuery("");
    setLocation("/shop");
    setMobileFiltersOpen(false);
  };
  
  return (
    <>
      <Helmet>
        <title>Shop | The Scent - Premium Aromatherapy Products</title>
        <meta name="description" content="Browse our collection of premium essential oils, natural soaps, and aromatherapy products." />
      </Helmet>
      
      <div className="bg-neutral-light py-8 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-heading mb-4">Shop Our Collection</h1>
            <p className="text-neutral-mid max-w-2xl mx-auto">
              Discover our range of premium aromatherapy products designed to enhance your well-being.
            </p>
          </div>
          
          {/* Mobile filter button and sort */}
          <div className="lg:hidden flex flex-col sm:flex-row gap-4 mb-6">
            <Button 
              variant="outline" 
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            
            <div className="sm:ml-auto w-full sm:w-auto">
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Featured</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters */}
            <div className="w-full lg:w-64 hidden lg:block">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-6">
                  <h3 className="font-heading text-lg mb-4">Search</h3>
                  <form onSubmit={handleSearchSubmit}>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Button type="submit" size="icon" variant="ghost">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </div>
                
                <Accordion type="single" collapsible className="mb-6">
                  <AccordionItem value="categories">
                    <AccordionTrigger className="font-heading text-lg">
                      Categories
                    </AccordionTrigger>
                    <AccordionContent>
                      {categoriesLoading ? (
                        <div className="space-y-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="h-6 bg-gray-200 rounded animate-pulse"></div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="all-categories" 
                              checked={!categoryFilter}
                              onCheckedChange={() => setCategoryFilter(null)}
                            />
                            <label htmlFor="all-categories" className="text-sm cursor-pointer">
                              All Categories
                            </label>
                          </div>
                          {categories?.map(category => (
                            <div key={category.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`category-${category.id}`} 
                                checked={categoryFilter === category.slug}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setCategoryFilter(category.slug);
                                  } else if (categoryFilter === category.slug) {
                                    setCategoryFilter(null);
                                  }
                                }}
                              />
                              <label htmlFor={`category-${category.id}`} className="text-sm cursor-pointer">
                                {category.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="price">
                    <AccordionTrigger className="font-heading text-lg">
                      Price
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <Slider
                          defaultValue={[0, 100]}
                          max={100}
                          step={1}
                          value={priceRange}
                          onValueChange={(value) => setPriceRange(value as [number, number])}
                        />
                        <div className="flex justify-between text-sm">
                          <span>${priceRange[0]}</span>
                          <span>${priceRange[1]}</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <h3 className="font-heading text-lg mb-4">Sort By</h3>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Featured</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="name-asc">Name: A to Z</SelectItem>
                    <SelectItem value="name-desc">Name: Z to A</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="mt-6 space-y-2">
                  <Button onClick={applyFilters} className="w-full">
                    Apply Filters
                  </Button>
                  <Button variant="outline" onClick={resetFilters} className="w-full">
                    Reset Filters
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Mobile filters sheet */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetContent side="left" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetClose className="absolute right-4 top-4">
                    <X className="h-5 w-5" />
                  </SheetClose>
                </SheetHeader>
                
                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="font-heading text-lg mb-4">Search</h3>
                    <Input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <h3 className="font-heading text-lg mb-4">Categories</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="mobile-all-categories" 
                          checked={!categoryFilter}
                          onCheckedChange={() => setCategoryFilter(null)}
                        />
                        <label htmlFor="mobile-all-categories" className="cursor-pointer">
                          All Categories
                        </label>
                      </div>
                      {categories?.map(category => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`mobile-category-${category.id}`} 
                            checked={categoryFilter === category.slug}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setCategoryFilter(category.slug);
                              } else if (categoryFilter === category.slug) {
                                setCategoryFilter(null);
                              }
                            }}
                          />
                          <label htmlFor={`mobile-category-${category.id}`} className="cursor-pointer">
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-heading text-lg mb-4">Price</h3>
                    <div className="space-y-4">
                      <Slider
                        defaultValue={[0, 100]}
                        max={100}
                        step={1}
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                      />
                      <div className="flex justify-between">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-heading text-lg mb-4">Sort By</h3>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Featured</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        <SelectItem value="name-asc">Name: A to Z</SelectItem>
                        <SelectItem value="name-desc">Name: Z to A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 pt-4">
                    <Button onClick={applyFilters} className="w-full">
                      Apply Filters
                    </Button>
                    <Button variant="outline" onClick={resetFilters} className="w-full">
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Products grid */}
            <div className="flex-1">
              {/* Active filters */}
              {(categoryFilter || searchQuery || sortOrder !== "default" || priceRange[0] > 0 || priceRange[1] < 100) && (
                <div className="mb-6 flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-neutral-mid">Active Filters:</span>
                  {categoryFilter && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1 h-8"
                      onClick={() => setCategoryFilter(null)}
                    >
                      Category: {categories?.find(c => c.slug === categoryFilter)?.name}
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  {searchQuery && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1 h-8"
                      onClick={() => setSearchQuery("")}
                    >
                      Search: {searchQuery}
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  {(priceRange[0] > 0 || priceRange[1] < 100) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1 h-8"
                      onClick={() => setPriceRange([0, 100])}
                    >
                      Price: ${priceRange[0]} - ${priceRange[1]}
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary h-8"
                    onClick={resetFilters}
                  >
                    Clear All
                  </Button>
                </div>
              )}
              
              {productsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
                      <div className="aspect-square bg-gray-200"></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                        <div className="flex justify-between items-center">
                          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : sortedProducts?.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-heading mb-2">No products found</h3>
                  <p className="text-neutral-mid mb-6">
                    We couldn't find any products matching your criteria.
                  </p>
                  <Button onClick={resetFilters}>
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sortedProducts?.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
