import { useEffect, useState } from "react";
import { useAuth, loginSchema, registerSchema } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Helmet } from "react-helmet";
import { 
  Form,
  FormControl,
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("login");

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  if (user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <>
      <Helmet>
        <title>Login or Register | The Scent</title>
        <meta name="description" content="Sign in to your account or create a new one to start shopping at The Scent." />
      </Helmet>

      <div className="min-h-screen bg-neutral-light py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Left side - Authentication forms */}
            <div className="w-full lg:w-1/2 max-w-md mx-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-8">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                {/* Login Form */}
                <TabsContent value="login">
                  <Card>
                    <CardHeader>
                      <CardTitle>Welcome Back</CardTitle>
                      <CardDescription>Enter your credentials to access your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="your@email.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? "Signing in..." : "Sign In"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <p className="text-sm text-neutral-mid">
                        Don't have an account?{" "}
                        <button 
                          className="text-primary hover:underline" 
                          onClick={() => setActiveTab("register")}
                        >
                          Register now
                        </button>
                      </p>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* Registration Form */}
                <TabsContent value="register">
                  <Card>
                    <CardHeader>
                      <CardTitle>Create an Account</CardTitle>
                      <CardDescription>Join The Scent community and start your wellness journey</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="your@email.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="johndoe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? "Creating account..." : "Create Account"}
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                      <p className="text-sm text-neutral-mid">
                        Already have an account?{" "}
                        <button 
                          className="text-primary hover:underline" 
                          onClick={() => setActiveTab("login")}
                        >
                          Sign in
                        </button>
                      </p>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right side - Hero content */}
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-heading mb-6">Discover The Power of Scent</h1>
              <p className="text-lg mb-8 text-neutral-mid">
                Join our community of wellness enthusiasts who have transformed their well-being through the power of aromatherapy. Create an account to:
              </p>
              <ul className="space-y-4 mb-8 text-left max-w-md mx-auto lg:mx-0">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-accent mt-1 mr-3"></i>
                  <span>Save your favorite products to your wishlist</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-accent mt-1 mr-3"></i>
                  <span>Track your orders and view purchase history</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-accent mt-1 mr-3"></i>
                  <span>Get personalized scent recommendations</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-accent mt-1 mr-3"></i>
                  <span>Receive exclusive offers and early access to new products</span>
                </li>
              </ul>
              <div className="hidden lg:block">
                <img 
                  src="https://raw.githubusercontent.com/nordeim/The-Scent/refs/heads/main/images/scent2.jpg" 
                  alt="Aromatherapy products" 
                  className="rounded-lg shadow-lg max-w-md mx-auto" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
