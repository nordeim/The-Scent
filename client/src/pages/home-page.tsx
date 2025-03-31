import { HeroSection } from "@/components/home/hero-section";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { FeaturedProducts } from "@/components/home/featured-products";
import { ProductSpotlight } from "@/components/home/product-spotlight";
import { MoodSelector } from "@/components/home/mood-selector";
import { TestimonialSlider } from "@/components/home/testimonial-slider";
import { Newsletter } from "@/components/home/newsletter";
import { InstagramFeed } from "@/components/home/instagram-feed";
import { Helmet } from "react-helmet";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>The Scent - Premium Aromatherapy Products</title>
        <meta name="description" content="Discover premium aromatherapy products to enhance your mental and physical well-being. Shop essential oils, natural soaps, and more." />
      </Helmet>
      
      <HeroSection />
      <CategoryShowcase />
      <FeaturedProducts />
      <ProductSpotlight />
      <MoodSelector />
      <TestimonialSlider />
      <Newsletter />
      <InstagramFeed />
    </>
  );
}
