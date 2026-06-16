'use client';

import { useEffect } from 'react';
import { Topic } from '@/types';
import { useProgress } from '@/context/ProgressContext';
import styles from './Modal.module.scss';

interface Props {
  topic: Topic;
  phaseName: string;
  onClose: () => void;
}

export default function Modal({ topic, phaseName, onClose }: Props) {
  const { state, toggleTopic } = useProgress();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <h3>{topic.name}</h3>
          <button className={styles.close} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles.body}>
          <div className={styles.meta}>
            <span className={`${styles.pri} ${styles[topic.pri]}`}>{topic.pri}</span>
            <span className={styles.phase}>{phaseName}</span>
          </div>
          {topic.detail ? (
            <div dangerouslySetInnerHTML={{ __html: topic.detail }} />
          ) : (
            <p>No detailed content available for this topic yet.</p>
          )}
          <div className={styles.actions}>
            <button
              className={`btn btn-sm ${state.topics[topic.id] ? 'btn-outline' : 'btn-primary'}`}
              onClick={() => toggleTopic(topic.id)}
            >
              {state.topics[topic.id] ? '✓ Marked Complete' : 'Mark as Complete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
