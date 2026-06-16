import { TIMELINE } from '@/data/phases';
import styles from './Timeline.module.scss';

export default function Timeline() {
  return (
    <section id="timeline">
      <div className="container">
        <div className="section-header">
          <div className="tag">Study Timeline</div>
          <h2>Day-by-Day Schedule</h2>
          <p>
            A structured 25-day plan. Follow it or adapt — the milestones keep
            you on track.
          </p>
        </div>
        <div className={styles.timeline}>
          {TIMELINE.map((item, i) => (
            <div className={styles.item} key={i}>
              <div className={`${styles.dot} ${styles[item.status]}`} />
              <div className={styles.content}>
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
                <div className={styles.days}>{item.day}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
