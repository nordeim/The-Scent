import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

export function Newsletter() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  });
  
  const onSubmit = async (data: NewsletterFormValues) => {
    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/newsletter", data);
      
      toast({
        title: "Subscription successful!",
        description: "Thank you for subscribing to our newsletter.",
      });
      
      form.reset();
    } catch (error: any) {
      toast({
        title: "Subscription failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <section className="py-20 px-6 bg-secondary relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10">
        <img 
          src="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80" 
          alt="Essential oils pattern" 
          className="h-full w-full object-cover" 
        />
      </div>
      <div className="container mx-auto relative z-10">
        <motion.div 
          className="max-w-xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-heading mb-4">Join Our Community</h2>
          <p className="text-neutral-mid mb-8">
            Subscribe to our newsletter for exclusive offers, aromatherapy tips, and early access to new products.
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input 
                        placeholder="Your email address" 
                        {...field} 
                        className="px-4 py-3 rounded-lg border border-secondary-dark focus:border-primary focus:ring-1 focus:ring-primary outline-none h-auto" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg transition font-medium h-auto"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </Form>
          
          <p className="text-xs text-neutral-mid mt-4">
            By subscribing, you agree to our Privacy Policy and consent to receive updates from The Scent.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
