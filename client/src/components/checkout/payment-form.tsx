import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, ArrowLeft } from "lucide-react";

const paymentSchema = z.object({
  nameOnCard: z.string().min(3, "Name on card is required"),
  cardNumber: z.string().min(16, "Enter a valid card number").max(16),
  expiryDate: z.string().min(5, "Enter a valid expiry date (MM/YY)"),
  cvv: z.string().min(3, "Enter a valid CVV").max(4),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  onComplete: (paymentDetails: PaymentFormValues) => void;
  onBack: () => void;
}

export function PaymentForm({ onComplete, onBack }: PaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("credit-card");
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      nameOnCard: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    }
  });
  
  const onSubmit = async (data: PaymentFormValues) => {
    setIsSubmitting(true);
    
    try {
      // In a real app, this would call the Stripe API
      // For demo purposes, we'll simulate a successful payment
      setTimeout(() => {
        onComplete(data);
      }, 1500);
    } catch (error) {
      console.error("Error processing payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatCardNumber = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 16);
  };
  
  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 2) return cleaned;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nameOnCard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name on Card</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Smith" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="1234 5678 9012 3456" 
                        value={field.value}
                        onChange={e => field.onChange(formatCardNumber(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date (MM/YY)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="01/25" 
                          value={field.value}
                          onChange={e => field.onChange(formatExpiryDate(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123" 
                          type="password" 
                          value={field.value}
                          onChange={e => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="text-sm text-neutral-mid mt-2">
                <p>For testing purposes, use:</p>
                <p>Card Number: 4242 4242 4242 4242</p>
                <p>Expiry: Any future date</p>
                <p>CVV: Any 3 digits</p>
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Place Order"}
                </Button>
              </div>
            </form>
          </Form>
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
