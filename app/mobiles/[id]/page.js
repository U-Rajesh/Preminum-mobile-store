import Link from 'next/link';
import { ArrowLeft, Smartphone } from 'lucide-react';
import { getMobileById } from '@/lib/services/mobiles';
import { getReviewsForMobile } from '@/lib/services/reviews';
import ProductGallery from '@/components/mobiles/ProductGallery';
import ProductInfo from '@/components/mobiles/ProductInfo';
import ProductReviews from '@/components/mobiles/ProductReviews';
import RelatedMobiles from '@/components/mobiles/RelatedMobiles';
import styles from './detail.module.css';

/**
 * Generates dynamic SEO metadata for the product detail page.
 */
export async function generateMetadata({ params }) {
  const { id } = await params;
  const mobile = await getMobileById(id);

  if (!mobile) {
    return {
      title: 'Mobile Not Found | MOBILÉ',
      description: 'The requested smartphone could not be found.',
    };
  }

  const primaryImage =
    mobile.mobile_images?.find((img) => img.display_order === 0) ||
    mobile.mobile_images?.[0];

  return {
    title: `${mobile.brand} ${mobile.name} | MOBILÉ`,
    description:
      mobile.description && mobile.description.length > 0
        ? mobile.description.slice(0, 160)
        : `Explore ${mobile.brand} ${mobile.name} featuring ${mobile.ram} RAM and ${mobile.storage} storage at MOBILÉ.`,
    openGraph: {
      title: `${mobile.brand} ${mobile.name} | MOBILÉ`,
      description:
        mobile.description && mobile.description.length > 0
          ? mobile.description.slice(0, 160)
          : `${mobile.brand} ${mobile.name} at MOBILÉ`,
      images: primaryImage?.image_url ? [{ url: primaryImage.image_url }] : [],
    },
  };
}

export default async function MobileDetailPage({ params }) {
  const { id } = await params;
  const mobile = await getMobileById(id);

  // If mobile is not found or is hidden
  if (!mobile) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.notFoundState}>
            <Smartphone size={48} className={styles.notFoundIcon} aria-hidden="true" />
            <h1 className={styles.notFoundTitle}>Mobile Not Found</h1>
            <p className={styles.notFoundText}>
              The mobile you&apos;re looking for doesn&apos;t exist or is currently
              unavailable in our catalog.
            </p>
            <Link href="/mobiles" className="btn btn-primary">
              <ArrowLeft size={16} aria-hidden="true" style={{ marginRight: '6px' }} />
              <span>Back to Mobiles</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const productReviews = await getReviewsForMobile(mobile.id);

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className={styles.breadcrumbNav} aria-label="Breadcrumb">
          <div className={styles.breadcrumbs}>
            <Link href="/" className={styles.breadcrumbLink}>
              Home
            </Link>
            <span className={styles.breadcrumbSeparator} aria-hidden="true">
              /
            </span>
            <Link href="/mobiles" className={styles.breadcrumbLink}>
              Mobiles
            </Link>
            <span className={styles.breadcrumbSeparator} aria-hidden="true">
              /
            </span>
            <span className={styles.breadcrumbCurrent} aria-current="page">
              {mobile.brand} {mobile.name}
            </span>
          </div>

          <Link href="/mobiles" className={styles.backLink}>
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back to Mobiles</span>
          </Link>
        </nav>

        {/* Two-Column Product Detail Layout */}
        <div className={styles.productGrid}>
          {/* Left Column: Product Image Gallery */}
          <div>
            <ProductGallery
              images={mobile.mobile_images || []}
              brand={mobile.brand}
              name={mobile.name}
            />
          </div>

          {/* Right Column: Product Information & Actions */}
          <div>
            <ProductInfo mobile={mobile} />
          </div>
        </div>

        {/* Customer Product Reviews Section */}
        <ProductReviews
          mobileId={mobile.id}
          mobileName={`${mobile.brand} ${mobile.name}`}
          initialReviews={productReviews}
        />

        {/* Related Mobiles Section */}
        <RelatedMobiles currentMobileId={mobile.id} brand={mobile.brand} />
      </div>
    </div>
  );
}
