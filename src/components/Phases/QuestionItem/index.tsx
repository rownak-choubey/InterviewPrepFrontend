'use client';

import { useState } from 'react';
import { Question } from '@/types';
import styles from './QuestionItem.module.scss';

interface Props {
  question: Question;
  index: number;
}

export default function QuestionItem({ question, index }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`${styles.item} ${isOpen ? styles.open : ''}`} onClick={() => setIsOpen(!isOpen)}>
      <div className={styles.head}>
        <span className={styles.num}>{index}</span>
        {question.q}
      </div>
      <div className={styles.body}>
        <div className={styles.answer}>{question.a}</div>
      </div>
    </div>
  );
}
