import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetClose,
  SheetFooter
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchIcon, User, Heart, ShoppingBag, Menu, X } from "lucide-react";

export function Header() {
  const { user, logoutMutation } = useAuth();
  const { itemCount } = useCart();
  const [, navigate] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    navigate(`/shop?query=${encodeURIComponent(searchQuery)}`);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className={`sticky top-0 z-50 bg-white ${scrolled ? 'shadow-md' : ''}`}>
      <div className="container mx-auto">
        {/* Top bar with promotions */}
        <div className="bg-primary text-white py-2 px-4 text-center text-sm font-accent">
          <p className="hidden sm:block">Free shipping on all orders over $50 | Sign up for our newsletter and get 10% off your first order</p>
          <p className="sm:hidden">Free shipping on orders over $50</p>
        </div>
        
        {/* Main navigation */}
        <div className="py-4 px-6 flex flex-col md:flex-row justify-between items-center">
          {/* Logo */}
          <div className="flex items-center mb-4 md:mb-0">
            <Link href="/">
              <a className="text-3xl font-heading font-semibold text-primary">The Scent</a>
            </Link>
            <span className="ml-2 text-xs font-accent text-neutral-mid">AROMATHERAPY</span>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="absolute right-6 top-16 md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6 text-primary" />
          </button>
          
          {/* Primary Navigation - Desktop */}
          <nav className="hidden md:flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <Link href="/">
              <a className="text-sm uppercase tracking-wider hover:text-accent transition">Home</a>
            </Link>
            <Link href="/shop">
              <a className="text-sm uppercase tracking-wider hover:text-accent transition">Shop</a>
            </Link>
            <Link href="/scent-finder">
              <a className="text-sm uppercase tracking-wider hover:text-accent transition">Scent Finder</a>
            </Link>
            <Link href="/about">
              <a className="text-sm uppercase tracking-wider hover:text-accent transition">About</a>
            </Link>
            <Link href="/contact">
              <a className="text-sm uppercase tracking-wider hover:text-accent transition">Contact</a>
            </Link>
          </nav>
          
          {/* Icons for user actions - Desktop */}
          <div className="hidden md:flex space-x-5">
            <button 
              className="text-primary hover:text-accent transition"
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon className="h-5 w-5" />
            </button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-primary hover:text-accent transition">
                    <User className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/account")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/orders")}>
                    Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/addresses")}>
                    Addresses
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <a className="text-primary hover:text-accent transition">
                  <User className="h-5 w-5" />
                </a>
              </Link>
            )}
            
            <Link href="/wishlist">
              <a className="text-primary hover:text-accent transition">
                <Heart className="h-5 w-5" />
              </a>
            </Link>
            
            <Link href="/cart">
              <a className="text-primary hover:text-accent transition relative">
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </a>
            </Link>
          </div>
          
          {/* Mobile Navigation Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left text-2xl font-heading text-primary">The Scent</SheetTitle>
                <SheetClose className="absolute right-4 top-4">
                  <X className="h-5 w-5" />
                </SheetClose>
              </SheetHeader>
              
              <nav className="flex flex-col gap-6 mt-8">
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <a className="text-base uppercase tracking-wider hover:text-accent transition">Home</a>
                </Link>
                <Link href="/shop" onClick={() => setMobileMenuOpen(false)}>
                  <a className="text-base uppercase tracking-wider hover:text-accent transition">Shop</a>
                </Link>
                <Link href="/scent-finder" onClick={() => setMobileMenuOpen(false)}>
                  <a className="text-base uppercase tracking-wider hover:text-accent transition">Scent Finder</a>
                </Link>
                <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
                  <a className="text-base uppercase tracking-wider hover:text-accent transition">About</a>
                </Link>
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                  <a className="text-base uppercase tracking-wider hover:text-accent transition">Contact</a>
                </Link>
              </nav>
              
              <div className="flex flex-col gap-4 mt-8">
                <div className="flex gap-4">
                  <Input 
                    type="text" 
                    placeholder="Search products..." 
                    className="flex-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                  />
                  <Button 
                    size="icon" 
                    className="bg-primary hover:bg-primary-dark"
                    onClick={handleSearch}
                  >
                    <SearchIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <SheetFooter className="mt-auto flex-col sm:flex-row gap-2">
                {user ? (
                  <>
                    <Button variant="outline" onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/account");
                    }}>
                      My Account
                    </Button>
                    <Button variant="outline" onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/auth");
                  }}>
                    Sign In
                  </Button>
                )}
                
                <Button onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/cart");
                }}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  View Cart {itemCount > 0 && `(${itemCount})`}
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          
          {/* Search Overlay */}
          <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
            <SheetContent side="top" className="h-[200px]">
              <SheetHeader>
                <SheetTitle className="text-xl font-heading text-primary">Search our products</SheetTitle>
                <SheetClose className="absolute right-4 top-4">
                  <X className="h-5 w-5" />
                </SheetClose>
              </SheetHeader>
              
              <form onSubmit={handleSearch} className="mt-6">
                <div className="flex gap-4">
                  <Input 
                    type="text" 
                    placeholder="Search for essential oils, soaps, and more..." 
                    className="flex-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary-dark"
                  >
                    Search
                  </Button>
                </div>
              </form>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
