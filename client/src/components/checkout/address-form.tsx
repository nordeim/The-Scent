import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const addressSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  addressLine1: z.string().min(5, "Address must be at least 5 characters"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  postalCode: z.string().min(3, "Postal code must be at least 3 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(5, "Phone number must be at least 5 characters"),
  saveAddress: z.boolean().default(false)
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
  onComplete: (address: AddressFormValues) => void;
}

export function AddressForm({ onComplete }: AddressFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get user's saved addresses (in a real app)
  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ["/api/addresses"],
    enabled: !!user
  });
  
  const [selectedSavedAddress, setSelectedSavedAddress] = useState<string>("");
  
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "United States",
      email: user?.email || "",
      phone: user?.phone || "",
      saveAddress: false
    }
  });
  
  // Pre-fill form when a saved address is selected
  useEffect(() => {
    if (selectedSavedAddress && addresses) {
      const address = addresses.find((a: any) => a.id.toString() === selectedSavedAddress);
      if (address) {
        form.reset({
          firstName: address.firstName || user?.firstName || "",
          lastName: address.lastName || user?.lastName || "",
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 || "",
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
          email: user?.email || "",
          phone: address.phone || user?.phone || "",
          saveAddress: false
        });
      }
    }
  }, [selectedSavedAddress, addresses, form, user]);
  
  const onSubmit = async (data: AddressFormValues) => {
    setIsSubmitting(true);
    
    try {
      // In a real app, you'd save the address if saveAddress is true
      // await apiRequest("POST", "/api/addresses", data);
      
      onComplete(data);
    } catch (error) {
      console.error("Error saving address:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      {/* Saved Addresses Dropdown (if user has saved addresses) */}
      {addresses && addresses.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Use a saved address</label>
          <Select
            value={selectedSavedAddress}
            onValueChange={setSelectedSavedAddress}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a saved address" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Enter a new address</SelectItem>
              {addresses.map((address: any) => (
                <SelectItem key={address.id} value={address.id.toString()}>
                  {address.addressLine1}, {address.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="addressLine1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 1</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="addressLine2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address Line 2 (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State/Province</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    {/* Add more countries as needed */}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {user && (
            <FormField
              control={form.control}
              name="saveAddress"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Save this address for future orders</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          )}
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-dark"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Continue to Payment"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
