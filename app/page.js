import Hero from "@/components/home/Hero";
import BrandMarquee from "@/components/home/BrandMarquee";
import FeaturedMobiles from "@/components/home/FeaturedMobiles";
import CustomerReviews from "@/components/home/CustomerReviews";

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <>
      <Hero />
      <BrandMarquee />
      <FeaturedMobiles />
      <CustomerReviews />
    </>
  );
}
