import { getVisibleMobiles } from '@/lib/services/mobiles';
import MobileCard from '@/components/home/MobileCard';
import styles from './RelatedMobiles.module.css';

export default async function RelatedMobiles({ currentMobileId, brand }) {
  if (!currentMobileId) return null;

  let allMobiles = [];
  try {
    allMobiles = await getVisibleMobiles();
  } catch (err) {
    console.error('Error fetching related mobiles:', err.message);
    return null;
  }

  // Filter out the current mobile
  const otherMobiles = allMobiles.filter((m) => m.id !== currentMobileId);
  if (otherMobiles.length === 0) return null;

  // Prioritize same-brand products, then other visible products
  const sameBrand = otherMobiles.filter(
    (m) =>
      brand &&
      m.brand &&
      m.brand.trim().toLowerCase() === brand.trim().toLowerCase()
  );
  const differentBrand = otherMobiles.filter(
    (m) =>
      !brand ||
      !m.brand ||
      m.brand.trim().toLowerCase() !== brand.trim().toLowerCase()
  );

  const relatedMobiles = [...sameBrand, ...differentBrand].slice(0, 4);

  if (relatedMobiles.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="related-mobiles-heading">
      <div className={styles.header}>
        <span className={styles.eyebrow}>Explore More</span>
        <h2 id="related-mobiles-heading" className={styles.heading}>
          Related Mobiles
        </h2>
      </div>

      <div className={styles.grid}>
        {relatedMobiles.map((mobile) => (
          <MobileCard key={mobile.id} mobile={mobile} />
        ))}
      </div>
    </section>
  );
}
