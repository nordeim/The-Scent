import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, ArrowLeft } from "lucide-react";
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

// Initialize the Stripe instance outside of the component
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentFormProps {
  onComplete: (paymentDetails: any) => void;
  onBack: () => void;
}

// Inner payment form (used inside Elements)
function PaymentFormInner({ onComplete, onBack }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("credit-card");
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast({
        title: "Error",
        description: "Stripe has not been properly initialized",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Confirm the payment with Stripe
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: 'if_required'
      });

      if (result.error) {
        toast({
          title: "Payment Failed",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        // Payment successful
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully!",
        });
        
        // Get the payment intent ID from the response or from session storage
        const paymentIntent = result.paymentIntent;
        const paymentIntentId = paymentIntent?.id || sessionStorage.getItem('currentPaymentIntentId') || Date.now().toString();
        
        // Call the onComplete callback with payment information
        onComplete({ 
          paymentStatus: 'success',
          paymentIntentId: paymentIntentId
        });
        
        // Clean up session storage
        sessionStorage.removeItem('currentPaymentIntentId');
      }
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "There was a problem processing your payment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="credit-card" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Credit Card</span>
          </TabsTrigger>
          <TabsTrigger value="paypal" disabled>
            <span>PayPal (Coming Soon)</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="credit-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            
            <div className="text-sm text-neutral-mid mt-4">
              <p>For testing purposes, use:</p>
              <p>Card Number: 4242 4242 4242 4242</p>
              <p>Expiry: Any future date</p>
              <p>CVV: Any 3 digits</p>
              <p>ZIP: Any valid postal code</p>
            </div>
            
            <div className="pt-6 flex flex-col sm:flex-row gap-3">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={onBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Shipping
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-primary hover:bg-primary-dark"
                disabled={isSubmitting || !stripe}
              >
                {isSubmitting ? "Processing..." : "Place Order"}
              </Button>
            </div>
          </form>
        </TabsContent>
        
        <TabsContent value="paypal">
          <div className="p-6 text-center border rounded-md">
            <p className="text-neutral-mid mb-4">
              PayPal integration coming soon. Please use credit card for now.
            </p>
            <Button 
              onClick={() => setPaymentMethod("credit-card")}
              variant="outline"
            >
              Switch to Credit Card
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Wrapper payment form with Stripe Elements setup
export function PaymentForm(props: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string>("");
  const { toast } = useToast();
  const { cart } = useCart();
  
  useEffect(() => {
    // Create a payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        // Calculate the total amount from the cart
        const amount = cart && cart.items ? 
          cart.items.reduce((sum: number, item: any) => sum + (parseFloat(item.product.price) * item.quantity), 0) : 0;
        
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount,
            currency: 'usd',
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }
        
        const data = await response.json();
        // Store the client secret for Stripe Elements
        setClientSecret(data.clientSecret);
        
        // Keep track of the payment intent ID for use in the success callback
        sessionStorage.setItem('currentPaymentIntentId', data.paymentIntentId);
      } catch (error: any) {
        console.error('Error creating payment intent:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize payment. Please try again.',
          variant: 'destructive',
        });
      }
    };
    
    createPaymentIntent();
  }, [cart, toast]);
  
  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3">Loading payment options...</span>
      </div>
    );
  }
  
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentFormInner {...props} />
    </Elements>
  );
}
