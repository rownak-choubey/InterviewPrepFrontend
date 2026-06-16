'use client';

import Hero from '@/components/Hero';
import Dashboard from '@/components/Dashboard';
import CompanyIntel from '@/components/CompanyIntel';
import Phases from '@/components/Phases';
import Timeline from '@/components/Timeline';
import QuickRef from '@/components/QuickRef';
import styles from './dashboard.module.scss';

export default function DashboardPage() {
  return (
    <main className={styles.main}>
      <Hero />
      <Dashboard />
      <CompanyIntel />
      <Phases />
      <Timeline />
      <QuickRef />
    </main>
  );
}
