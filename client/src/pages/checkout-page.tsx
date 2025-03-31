import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, CreditCard, CheckCircle } from "lucide-react";
import { CartSummary } from "@/components/cart/cart-summary";
import { AddressForm } from "@/components/checkout/address-form";
import { PaymentForm } from "@/components/checkout/payment-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

type CheckoutStep = "shipping" | "payment" | "confirmation";

export default function CheckoutPage() {
  const { cart, isLoading, isEmpty, clearCart } = useCart();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState<CheckoutStep>("shipping");
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [shippingAddress, setShippingAddress] = useState<any>(null);
  
  // Redirect if not authenticated or cart is empty
  if (!isLoading && (!user || isEmpty)) {
    navigate(isEmpty ? "/cart" : "/auth?redirect=checkout");
    return null;
  }
  
  const handleShippingComplete = (address: any) => {
    setShippingAddress(address);
    setStep("payment");
  };
  
  const handlePaymentComplete = async (paymentDetails: any) => {
    try {
      // Get the cart items to create an order
      if (!cart || !cart.items || !shippingAddress) {
        toast({
          title: "Error",
          description: "Missing cart items or shipping address",
          variant: "destructive",
        });
        return;
      }
      
      // Create an order in the database
      const orderData = {
        userId: user?.id,
        total: cart.items.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0).toString(),
        shippingAddressId: shippingAddress.id, 
        billingAddressId: shippingAddress.id, // Using same address for billing and shipping
        orderNumber: `ORD-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
        status: "pending",
        paymentStatus: "completed",
        stripePaymentIntentId: paymentDetails?.paymentIntentId || Date.now().toString(),
      };
      
      // Send the order to the server
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      
      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }
      
      // Get the created order
      const order = await orderResponse.json();
      setOrderNumber(order.orderNumber);
      
      // Create order items
      const orderItemPromises = cart.items.map(item => 
        fetch('/api/order-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: parseFloat(item.product.price).toString()
          })
        })
      );
      
      await Promise.all(orderItemPromises);
      
      // Show success toast
      toast({
        title: "Order placed successfully!",
        description: `Your order #${order.orderNumber} has been confirmed.`,
      });
      
      // Clear the cart
      clearCart();
      
      // Move to confirmation step
      setStep("confirmation");
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        title: "Error placing order",
        description: "There was a problem processing your order. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Checkout | The Scent</title>
        <meta name="description" content="Complete your purchase of premium aromatherapy products." />
      </Helmet>
      
      <div className="bg-neutral-light py-12 px-6">
        <div className="container mx-auto">
          <h1 className="text-4xl font-heading mb-8 text-center">Checkout</h1>
          
          {/* Checkout steps indicator */}
          <div className="max-w-4xl mx-auto mb-8">
            <Tabs value={step} className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger 
                  value="shipping" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  disabled={step !== "shipping"}
                >
                  Shipping
                </TabsTrigger>
                <TabsTrigger 
                  value="payment" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  disabled={step !== "payment"}
                >
                  Payment
                </TabsTrigger>
                <TabsTrigger 
                  value="confirmation" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  disabled={step !== "confirmation"}
                >
                  Confirmation
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="shipping" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-white rounded-lg shadow-sm p-6"
                    >
                      <h2 className="text-2xl font-heading mb-6">Shipping Address</h2>
                      <AddressForm onComplete={handleShippingComplete} />
                    </motion.div>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <CartSummary showCheckoutButton={false} />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="payment" className="mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-white rounded-lg shadow-sm p-6"
                    >
                      <h2 className="text-2xl font-heading mb-6">Payment Information</h2>
                      <PaymentForm 
                        onComplete={handlePaymentComplete}
                        onBack={() => setStep("shipping")}
                      />
                    </motion.div>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <CartSummary showCheckoutButton={false} />
                    
                    {shippingAddress && (
                      <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                        <h3 className="font-heading text-lg mb-4">Shipping Address</h3>
                        <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                        <p>{shippingAddress.addressLine1}</p>
                        {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                        <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                        <p>{shippingAddress.country}</p>
                        
                        <Button 
                          variant="outline" 
                          className="mt-4 w-full text-primary border-primary"
                          onClick={() => setStep("shipping")}
                        >
                          Edit Address
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="confirmation" className="mt-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center"
                >
                  <div className="flex justify-center mb-6">
                    <CheckCircle className="h-20 w-20 text-accent" />
                  </div>
                  
                  <h2 className="text-3xl font-heading mb-4">Thank You for Your Order!</h2>
                  <p className="text-xl mb-2">Order #{orderNumber}</p>
                  <p className="text-neutral-mid mb-8">
                    A confirmation has been sent to your email address.
                  </p>
                  
                  <div className="bg-neutral-light p-6 rounded-lg mb-8">
                    <h3 className="font-heading text-xl mb-4">What Happens Next?</h3>
                    <ul className="text-left space-y-4">
                      <li className="flex items-start">
                        <span className="font-medium mr-2">1.</span>
                        <span>Your order is being processed by our team.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium mr-2">2.</span>
                        <span>You will receive a shipping confirmation email with tracking information once your order ships.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium mr-2">3.</span>
                        <span>Your aromatherapy products will arrive in 3-5 business days.</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button 
                      variant="outline" 
                      className="bg-white hover:bg-neutral-light"
                      onClick={() => navigate("/")}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Home
                    </Button>
                    
                    <Button 
                      className="bg-primary hover:bg-primary-dark"
                      onClick={() => navigate("/shop")}
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
