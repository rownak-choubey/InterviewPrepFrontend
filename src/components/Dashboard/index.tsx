'use client';

import { useProgress } from '@/context/ProgressContext';
import ProgressRing from './ProgressRing';
import MilestoneList from './MilestoneList';
import styles from './Dashboard.module.scss';

const CARDS = [
  { icon: '📚', key: 'completedTopics' as const, label: 'Topics Completed' },
  { icon: '✅', key: 'completedPhases' as const, label: 'Phases Done', format: (v: number) => `${v}/10` },
  { icon: '🎯', key: 'percentage' as const, label: 'Overall Progress', format: (v: number) => `${v}%` },
  { icon: '⏱', key: 'streak' as const, label: 'Day Streak' },
];

const MESSAGES: [number, string][] = [
  [0, 'Start checking off topics to track your progress here.'],
  [25, "Great start! You're building momentum. Keep going!"],
  [50, "Halfway there! The foundation is solid. Time to go deeper."],
  [75, "Almost there! Final push — you're going to crush this interview."],
  [100, 'ALL TOPICS COMPLETE! You\'re fully prepared. Go ace that interview! 🎉'],
];

function getMessage(pct: number): string {
  return MESSAGES.filter((m) => pct >= m[0]).pop()?.[1] ?? MESSAGES[0][1];
}

export default function Dashboard() {
  const { stats, milestones } = useProgress();

  return (
    <section className={styles.dashboard} id="dashboard">
      <div className="container">
        <div className="section-header">
          <div className="tag">Your Progress</div>
          <h2>Preparation Dashboard</h2>
          <p>Track your progress across all phases. Your data is saved locally.</p>
        </div>

        <div className={styles.grid}>
          {CARDS.map((card) => (
            <div className={styles.card} key={card.key}>
              <div className={styles.icon}>{card.icon}</div>
              <div className={styles.value}>
                {card.format ? card.format(stats[card.key]) : stats[card.key]}
              </div>
              <div className={styles.label}>{card.label}</div>
            </div>
          ))}
        </div>

        <div className={styles.progressSection}>
          <div className={styles.progressWrap}>
            <ProgressRing percentage={stats.percentage} />
            <div className={styles.details}>
              <h3>Keep Going!</h3>
              <p>{getMessage(stats.percentage)}</p>
              <div className={styles.barWrap}>
                <div className={styles.bar} style={{ width: `${stats.percentage}%` }} />
              </div>
              <div className={styles.progressLabel}>
                {stats.completedTopics} of {stats.totalTopics} topics completed
              </div>
              <MilestoneList milestones={milestones} percentage={stats.percentage} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
