import styles from './IntelGrid.module.scss';

interface IntelItem {
  icon: string;
  title: string;
  content?: string;
  items?: string[];
}

interface Props {
  items: IntelItem[];
}

export default function IntelGrid({ items }: Props) {
  return (
    <div className={styles.grid}>
      {items.map((item, i) => (
        <div className={styles.card} key={i}>
          <h4>
            {item.icon} {item.title}
          </h4>
          {item.content && <p>{item.content}</p>}
          {item.items && (
            <ul>
              {item.items.map((li, j) => (
                <li key={j}>{li}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
