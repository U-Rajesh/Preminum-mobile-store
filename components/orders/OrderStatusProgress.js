'use client';

import { Clock, CheckCircle2, Package, Truck, CheckCheck, XCircle } from 'lucide-react';
import styles from './OrderStatusProgress.module.css';

const LIFECYCLE_STEPS = [
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCheck },
];

const STATUS_INDEX = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
};

export default function OrderStatusProgress({ status }) {
  const isCancelled = status === 'cancelled';
  const currentIndex = STATUS_INDEX[status] ?? 0;

  if (isCancelled) {
    return (
      <div className={styles.cancelledBanner} role="status">
        <XCircle size={20} className={styles.cancelledIcon} aria-hidden="true" />
        <div>
          <div className={styles.cancelledTitle}>Order Cancelled</div>
          <div className={styles.cancelledDesc}>
            This order has been cancelled and is no longer being processed.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stepperContainer} aria-label={`Order status: ${status}`}>
      <div className={styles.stepsRow}>
        {LIFECYCLE_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isUpcoming = idx > currentIndex;

          let stepClass = styles.stepUpcoming;
          if (isDone) stepClass = styles.stepDone;
          if (isCurrent) stepClass = styles.stepCurrent;

          return (
            <div key={step.key} className={`${styles.stepItem} ${stepClass}`}>
              <div className={styles.iconWrapper}>
                <Icon size={16} aria-hidden="true" />
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
              {idx < LIFECYCLE_STEPS.length - 1 && (
                <div
                  className={`${styles.connectorLine} ${idx < currentIndex ? styles.connectorDone : ''}`}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
