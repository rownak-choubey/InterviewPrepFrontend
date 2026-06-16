'use client';

import { Phase, Topic } from '@/types';
import { PHASES } from '@/data/phases';
import PhaseCard from './PhaseCard';
import Modal from '@/components/Modal';
import { useState } from 'react';
import styles from './Phases.module.scss';

export default function Phases() {
  const [modalData, setModalData] = useState<{ topic: Topic; phaseName: string } | null>(null);

  const handleOpenTopic = (topic: Topic, phaseName: string) => {
    setModalData({ topic, phaseName });
  };

  return (
    <section id="phases">
      <div className="container">
        <div className="section-header">
          <div className="tag">Preparation Phases</div>
          <h2>Your 25-Day Battle Plan</h2>
          <p>
            Click each phase to expand. Check off topics as you complete them.
            Progress saves automatically.
          </p>
        </div>
        <div className={styles.grid}>
          {PHASES.map((phase) => (
            <PhaseCard key={phase.id} phase={phase} onOpenTopic={handleOpenTopic} />
          ))}
        </div>
      </div>

      {modalData && (
        <Modal
          topic={modalData.topic}
          phaseName={modalData.phaseName}
          onClose={() => setModalData(null)}
        />
      )}
    </section>
  );
}
