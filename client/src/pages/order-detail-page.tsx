import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet";
import { Loader2, ArrowLeft, PackageOpen } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: string;
}

interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: string;
  total: string;
  createdAt: string;
  updatedAt: string;
  paymentStatus: string;
  items?: OrderItem[];
}

export default function OrderDetailPage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const [matched, params] = useRoute("/orders/:id");
  const orderId = params?.id ? parseInt(params.id) : undefined;

  const {
    data: order,
    isLoading,
    error,
  } = useQuery<Order>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId && !!user,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-20 flex justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>Please log in to view order details</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!matched || !orderId) {
    return (
      <div className="container mx-auto py-20 flex justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Invalid Order</CardTitle>
            <CardDescription>The order ID is invalid or missing</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/orders")}>Back to Orders</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{order ? `Order #${order.orderNumber}` : "Order Details"} | The Scent</title>
      </Helmet>
      <div className="container mx-auto py-10">
        <Button 
          variant="outline" 
          onClick={() => navigate("/orders")} 
          className="mb-6 flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Orders
        </Button>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-10">
              <div className="text-center">
                <p className="text-red-500 mb-2">Failed to load order details</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        ) : !order ? (
          <Card>
            <CardContent className="py-16 flex flex-col items-center justify-center">
              <PackageOpen className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium mb-2">Order Not Found</h3>
              <p className="text-gray-500 mb-6 text-center max-w-md">
                We couldn't find the order you're looking for.
              </p>
              <Button onClick={() => navigate("/orders")}>
                Go Back to Orders
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-8">
              <CardHeader className="bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>Order #{order.orderNumber}</CardTitle>
                    <CardDescription>
                      Placed on {formatDate(order.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3 mt-3 md:mt-0">
                    <Badge className={getStatusColor(order.status)} variant="outline">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <Badge className={getPaymentStatusColor(order.paymentStatus)} variant="outline">
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-medium mb-4">Order Items</h2>
                <Card>
                  <CardContent className="px-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/2">Product</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-center">Quantity</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.items?.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>Product {item.productId}</TableCell>
                            <TableCell className="text-right">${parseFloat(item.price).toFixed(2)}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">
                              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center bg-gray-50">
                    <div className="font-medium">Total: ${parseFloat(order.total).toFixed(2)}</div>
                  </CardFooter>
                </Card>
              </div>

              <div>
                <h2 className="text-xl font-medium mb-4">Order Summary</h2>
                <Card>
                  <CardContent className="py-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Order Number</span>
                        <span className="font-medium">{order.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date</span>
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status</span>
                        <Badge className={getStatusColor(order.status)} variant="outline">
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Payment</span>
                        <Badge className={getPaymentStatusColor(order.paymentStatus)} variant="outline">
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal</span>
                        <span>${parseFloat(order.total).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Shipping</span>
                        <span>$0.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tax</span>
                        <span>$0.00</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>${parseFloat(order.total).toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}