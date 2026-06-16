'use client';

import { Topic } from '@/types';
import { useProgress } from '@/context/ProgressContext';
import styles from './TopicCard.module.scss';

interface Props {
  topic: Topic;
  phaseName: string;
  onOpen: (topic: Topic, phaseName: string) => void;
}

export default function TopicCard({ topic, phaseName, onOpen }: Props) {
  const { state, toggleTopic } = useProgress();

  return (
    <div className={styles.card} onClick={() => onOpen(topic, phaseName)}>
      <span className={`${styles.pri} ${styles[topic.pri]}`}>{topic.pri}</span>
      <h4 className={styles.name}>{topic.name}</h4>
      <p className={styles.desc}>{topic.desc}</p>
      <div
        className={`${styles.check} ${state.topics[topic.id] ? styles.done : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          toggleTopic(topic.id);
        }}
      >
        ✓
      </div>
    </div>
  );
}
