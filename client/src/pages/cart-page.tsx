import { useCart } from "@/hooks/use-cart";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

export default function CartPage() {
  const { cart, isLoading, updateCartItem, removeCartItem, itemCount, subtotal, isEmpty } = useCart();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const handleQuantityChange = (id: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      updateCartItem({ id, quantity: newQuantity });
    }
  };
  
  const handleRemoveItem = (id: number) => {
    removeCartItem(id);
  };
  
  const handleCheckout = () => {
    if (user) {
      navigate("/checkout");
    } else {
      navigate("/auth?redirect=checkout");
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Shopping Cart | The Scent</title>
        <meta name="description" content="Review and update your shopping cart before checkout." />
      </Helmet>
      
      <div className="bg-neutral-light py-12 px-6">
        <div className="container mx-auto">
          <h1 className="text-4xl font-heading mb-8 text-center">Shopping Cart</h1>
          
          {isLoading ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-8"></div>
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex py-6 border-b border-gray-200">
                    <div className="h-24 w-24 bg-gray-200 rounded flex-shrink-0"></div>
                    <div className="ml-6 flex-1">
                      <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                        <div className="h-5 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="mt-8 flex justify-between">
                  <div className="h-6 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="mt-8 flex justify-end">
                  <div className="h-10 bg-gray-200 rounded w-40"></div>
                </div>
              </div>
            </div>
          ) : isEmpty ? (
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-12 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center justify-center w-24 h-24 bg-neutral-light rounded-full mb-6">
                  <ShoppingBag className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-2xl font-heading mb-4">Your cart is empty</h2>
                <p className="text-neutral-mid mb-8">
                  Looks like you haven't added any products to your cart yet.
                </p>
                <Button 
                  onClick={() => navigate("/shop")}
                  className="bg-primary hover:bg-primary-dark"
                >
                  Start Shopping
                </Button>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm p-6">
                {/* Cart header - mobile hidden */}
                <div className="hidden md:flex py-4 border-b border-gray-200 font-medium">
                  <div className="w-2/5">Product</div>
                  <div className="w-1/5 text-center">Price</div>
                  <div className="w-1/5 text-center">Quantity</div>
                  <div className="w-1/5 text-right">Total</div>
                </div>
                
                {/* Cart items */}
                {cart?.items.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    className="flex flex-col md:flex-row py-6 border-b border-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {/* Product info */}
                    <div className="flex md:w-2/5">
                      <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-md">
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-4 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-medium">
                            <button onClick={() => navigate(`/products/${item.product.slug}`)}>
                              {item.product.name}
                            </button>
                          </h3>
                          <p className="mt-1 text-sm text-neutral-mid">
                            {item.product.shortDescription}
                          </p>
                        </div>
                        <button 
                          className="text-primary hover:text-accent text-sm flex items-center mt-2 md:mt-0"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Price - mobile */}
                    <div className="flex justify-between items-center mt-4 md:hidden">
                      <span className="text-sm font-medium">Price:</span>
                      <span>${parseFloat(item.product.price.toString()).toFixed(2)}</span>
                    </div>
                    
                    {/* Price - desktop */}
                    <div className="hidden md:flex md:w-1/5 items-center justify-center">
                      <span>${parseFloat(item.product.price.toString()).toFixed(2)}</span>
                    </div>
                    
                    {/* Quantity - mobile */}
                    <div className="flex justify-between items-center mt-4 md:hidden">
                      <span className="text-sm font-medium">Quantity:</span>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button 
                          className="w-8 h-8 flex items-center justify-center text-neutral-mid hover:text-primary"
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <div className="w-8 h-8 flex items-center justify-center font-medium">
                          {item.quantity}
                        </div>
                        <button 
                          className="w-8 h-8 flex items-center justify-center text-neutral-mid hover:text-primary"
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                          disabled={item.quantity >= 10}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Quantity - desktop */}
                    <div className="hidden md:flex md:w-1/5 items-center justify-center">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button 
                          className="w-8 h-8 flex items-center justify-center text-neutral-mid hover:text-primary"
                          onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <div className="w-8 h-8 flex items-center justify-center font-medium">
                          {item.quantity}
                        </div>
                        <button 
                          className="w-8 h-8 flex items-center justify-center text-neutral-mid hover:text-primary"
                          onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                          disabled={item.quantity >= 10}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Total - mobile */}
                    <div className="flex justify-between items-center mt-4 md:hidden">
                      <span className="text-sm font-medium">Total:</span>
                      <span className="font-medium">
                        ${(parseFloat(item.product.price.toString()) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Total - desktop */}
                    <div className="hidden md:flex md:w-1/5 items-center justify-end font-medium">
                      ${(parseFloat(item.product.price.toString()) * item.quantity).toFixed(2)}
                    </div>
                  </motion.div>
                ))}
                
                {/* Cart summary */}
                <div className="mt-8">
                  <div className="flex justify-between py-2 border-t border-gray-200">
                    <span className="font-medium">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 text-neutral-mid text-sm">
                    <span>Shipping calculated at checkout</span>
                  </div>
                  <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
                    <Button 
                      variant="outline" 
                      className="text-primary border-primary"
                      onClick={() => navigate("/shop")}
                    >
                      Continue Shopping
                    </Button>
                    <Button 
                      className="bg-primary hover:bg-primary-dark flex items-center"
                      onClick={handleCheckout}
                    >
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
