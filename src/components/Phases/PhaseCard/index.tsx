'use client';

import { useState } from 'react';
import { Phase, Topic } from '@/types';
import { useProgress } from '@/context/ProgressContext';
import TopicCard from '@/components/Phases/TopicCard';
import QuestionItem from '@/components/Phases/QuestionItem';
import styles from './PhaseCard.module.scss';

interface Props {
  phase: Phase;
  onOpenTopic: (topic: Topic, phaseName: string) => void;
}

export default function PhaseCard({ phase, onOpenTopic }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { state, toggleAllPhase } = useProgress();

  const doneCount = phase.topics.filter((t) => state.topics[t.id]).length;
  const allDone = doneCount === phase.topics.length;

  return (
    <div className={`${styles.card} ${isOpen ? styles.open : ''}`}>
      <div className={styles.header} onClick={() => setIsOpen(!isOpen)}>
        <div className={styles.number} style={{ background: `${phase.color}22`, color: phase.color }}>
          {phase.icon}
        </div>
        <div className={styles.info}>
          <h3>Phase {phase.id}: {phase.title}</h3>
          <p>
            {phase.days} · {phase.hours}{' '}
            {phase.priority && (
              <span style={{ color: getPriorityColor(phase.priority) }}>{phase.priority}</span>
            )}
          </p>
        </div>
        <div className={styles.meta}>
          <span className={styles.count}>{doneCount}/{phase.topics.length}</span>
          <div
            className={`${styles.check} ${allDone ? styles.done : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleAllPhase(phase.id);
            }}
          >
            ✓
          </div>
          <div className={styles.chevron}>▼</div>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.content}>
          <p className={styles.desc}>{phase.desc}</p>
          <div className={styles.topicsGrid}>
            {phase.topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} phaseName={phase.title} onOpen={onOpenTopic} />
            ))}
          </div>
          {phase.questions.length > 0 && (
            <div className={styles.questions}>
              <h4>🎯 Practice Questions</h4>
              {phase.questions.map((q, i) => (
                <QuestionItem key={i} question={q} index={i + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getPriorityColor(pri: string): string {
  const colors: Record<string, string> = {
    critical: 'var(--red)',
    high: 'var(--orange)',
    medium: 'var(--blue)',
  };
  return colors[pri] || 'var(--text3)';
}
