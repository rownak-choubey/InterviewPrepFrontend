import { QUICKREF } from '@/data/phases';
import styles from './QuickRef.module.scss';

export default function QuickRef() {
  return (
    <section id="quickref">
      <div className="container">
        <div className="section-header">
          <div className="tag">Cheat Sheet</div>
          <h2>Top 15 Must-Prepare Topics</h2>
          <p>Your quick-reference guide for the most critical interview topics.</p>
        </div>
        <div className={styles.grid}>
          {QUICKREF.map((item, i) => (
            <div className={styles.item} key={i}>
              <div className={styles.num}>{i + 1}</div>
              <div className={styles.text}>{item}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
