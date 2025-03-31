import { Link } from "wouter";
import { 
  InstagramIcon, 
  FacebookIcon, 
  TwitterIcon, 
  PinterestIcon, 
  MapPinIcon, 
  PhoneIcon, 
  MailIcon 
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleNewsletterSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/newsletter", { email });
      toast({
        title: "Thank you!",
        description: "You have been subscribed to our newsletter.",
      });
      setEmail("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Column */}
          <div>
            <h3 className="font-heading text-xl mb-4">About The Scent</h3>
            <p className="text-white/70 mb-4">
              We create premium aromatherapy products to enhance mental and physical well-being through the power of scent.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition">
                <PinterestIcon className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition">
                <TwitterIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Shop Column */}
          <div>
            <h3 className="font-heading text-xl mb-4">Shop</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shop?category=essential-oils">
                  <a className="text-white/70 hover:text-white transition">Essential Oils</a>
                </Link>
              </li>
              <li>
                <Link href="/shop?category=natural-soaps">
                  <a className="text-white/70 hover:text-white transition">Natural Soaps</a>
                </Link>
              </li>
              <li>
                <Link href="/shop?category=gift-sets">
                  <a className="text-white/70 hover:text-white transition">Gift Sets</a>
                </Link>
              </li>
              <li>
                <Link href="/shop?new=true">
                  <a className="text-white/70 hover:text-white transition">New Arrivals</a>
                </Link>
              </li>
              <li>
                <Link href="/shop?bestsellers=true">
                  <a className="text-white/70 hover:text-white transition">Bestsellers</a>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Help Column */}
          <div>
            <h3 className="font-heading text-xl mb-4">Help</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact">
                  <a className="text-white/70 hover:text-white transition">Contact Us</a>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <a className="text-white/70 hover:text-white transition">FAQs</a>
                </Link>
              </li>
              <li>
                <Link href="/shipping">
                  <a className="text-white/70 hover:text-white transition">Shipping & Returns</a>
                </Link>
              </li>
              <li>
                <Link href="/track-order">
                  <a className="text-white/70 hover:text-white transition">Track Your Order</a>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <a className="text-white/70 hover:text-white transition">Privacy Policy</a>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Column */}
          <div>
            <h3 className="font-heading text-xl mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPinIcon className="h-5 w-5 mt-1 mr-3 text-accent" />
                <span className="text-white/70">123 Aromatherapy Lane, Wellness City, WB 12345</span>
              </li>
              <li className="flex items-start">
                <PhoneIcon className="h-5 w-5 mt-1 mr-3 text-accent" />
                <span className="text-white/70">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start">
                <MailIcon className="h-5 w-5 mt-1 mr-3 text-accent" />
                <span className="text-white/70">hello@thescent.com</span>
              </li>
            </ul>
            
            <form onSubmit={handleNewsletterSignup} className="mt-6">
              <h4 className="text-sm font-medium mb-2">Subscribe to Newsletter</h4>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Button 
                  type="submit" 
                  variant="secondary" 
                  size="sm" 
                  disabled={isSubmitting}
                >
                  Join
                </Button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/70 text-sm">
            &copy; {new Date().getFullYear()} The Scent. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <img src="https://via.placeholder.com/200x30/204E4A/FFFFFF?text=Payment+Methods" alt="Payment methods" className="h-8" />
          </div>
        </div>
      </div>
    </footer>
  );
}
