import { Milestone } from '@/types';
import styles from './MilestoneList.module.scss';

interface Props {
  milestones: Milestone[];
  percentage: number;
}

export default function MilestoneList({ milestones, percentage }: Props) {
  return (
    <div className={styles.list}>
      {milestones.map((m) => (
        <span
          key={m.pct}
          className={`${styles.tag} ${percentage >= m.pct ? styles.done : styles.pending}`}
          style={percentage >= m.pct ? { color: m.color } : undefined}
        >
          {percentage >= m.pct ? '✓' : '○'} {m.label}
        </span>
      ))}
    </div>
  );
}
