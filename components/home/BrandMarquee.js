import styles from './BrandMarquee.module.css';

const brands = [
  'Apple',
  'Samsung',
  'Google',
  'OnePlus',
  'Xiaomi',
  'Nothing',
  'Vivo',
  'OPPO',
  'Motorola',
  'Sony',
];

export default function BrandMarquee() {
  return (
    <section className={styles.section} aria-label="Brands Showcase">
      <div className="container">
        <div className={styles.header}>
          <span className={styles.label}>Brands We Carry</span>
        </div>
      </div>

      <div className={styles.viewport}>
        <div className={styles.track}>
          {/* First Group: Accessible to Screen Readers */}
          <div className={styles.group}>
            {brands.map((brand, index) => (
              <span key={`brand-primary-${index}`} className={styles.item}>
                {brand}
                <span className={styles.separator} aria-hidden="true" />
              </span>
            ))}
          </div>

          {/* Second Group: Duplicate for Seamless Infinite Loop (Hidden from Screen Readers) */}
          <div className={styles.group} aria-hidden="true">
            {brands.map((brand, index) => (
              <span key={`brand-duplicate-${index}`} className={styles.item}>
                {brand}
                <span className={styles.separator} aria-hidden="true" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
