'use client';

import { useEffect, useRef } from 'react';
import styles from './ProgressRing.module.scss';

interface Props {
  percentage: number;
}

export default function ProgressRing({ percentage }: Props) {
  const ringRef = useRef<SVGCircleElement>(null);
  const circumference = 2 * Math.PI * 70;

  useEffect(() => {
    if (ringRef.current) {
      const offset = circumference - (percentage / 100) * circumference;
      ringRef.current.style.strokeDashoffset = String(offset);
    }
  }, [percentage, circumference]);

  return (
    <div className={styles.container}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6c5ce7" />
            <stop offset="100%" stopColor="#fd79a8" />
          </linearGradient>
        </defs>
        <circle className={styles.bg} cx="80" cy="80" r="70" />
        <circle
          ref={ringRef}
          className={styles.progress}
          cx="80"
          cy="80"
          r="70"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      <div className={styles.text}>
        <div className={styles.pct}>{percentage}%</div>
        <div className={styles.sub}>Complete</div>
      </div>
    </div>
  );
}
