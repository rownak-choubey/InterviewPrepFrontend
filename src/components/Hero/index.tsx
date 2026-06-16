'use client';

import { useProgress } from '@/context/ProgressContext';
import styles from './Hero.module.scss';

export default function Hero() {
  const { stats } = useProgress();

  const scrollTo = (selector: string) => {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className={styles.hero} id="hero">
      <div className="container">
        <div className={styles.content}>
          <div className={styles.badge}>
            <span className={styles.dot} />
            Senior .NET Developer Role — Meru Data, Hyderabad
          </div>
          <h1 className={styles.title}>
            Crack Your <span className={styles.gradient}>Meru Data</span> Interview
          </h1>
          <p className={styles.subtitle}>
            A comprehensive, interactive roadmap covering C#, .NET Core, Angular,
            SQL Server, Elasticsearch, Architecture, and the Data Governance domain.
          </p>
          <div className={styles.actions}>
            <button className="btn btn-primary" onClick={() => scrollTo('#phases')}>
              Start Preparing →
            </button>
            <button className="btn btn-outline" onClick={() => scrollTo('#dashboard')}>
              View Progress
            </button>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.num}>{stats.totalTopics}</div>
              <div className={styles.label}>Topics</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.num}>{stats.completedTopics}</div>
              <div className={styles.label}>Completed</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.num}>25</div>
              <div className={styles.label}>Days Plan</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.num}>10</div>
              <div className={styles.label}>Phases</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
