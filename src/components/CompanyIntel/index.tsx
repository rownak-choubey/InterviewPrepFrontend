'use client';

import { useState } from 'react';
import { COMPANY_INTEL } from '@/data/phases';
import IntelGrid from './IntelGrid';
import styles from './CompanyIntel.module.scss';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'product', label: 'Product Stack' },
  { id: 'tech', label: 'Tech Stack' },
  { id: 'culture', label: 'Culture & Tips' },
  { id: 'interview', label: 'Interview Process' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function CompanyIntel() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <section id="company">
      <div className="container">
        <div className="section-header">
          <div className="tag">Company Intel</div>
          <h2>Know Meru Data Inside Out</h2>
          <p>
            Understanding the company gives you a massive edge. They&apos;re a
            startup — they need owners, not just coders.
          </p>
        </div>

        <div className={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={`${styles.content} ${styles.active}`}>
          <IntelGrid items={COMPANY_INTEL[activeTab]} />
        </div>
      </div>
    </section>
  );
}
