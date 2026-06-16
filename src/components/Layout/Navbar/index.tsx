'use client';

import { useRouter } from 'next/navigation';
import { useScrollActive, useNavScrolled } from '@/hooks/useScroll';
import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/context/ProgressContext';
import { useTheme } from '@/context/ThemeContext';
import styles from './Navbar.module.scss';

const NAV_ITEMS = [
  { href: '#hero', label: 'Home' },
  { href: '#dashboard', label: 'Dashboard' },
  { href: '#company', label: 'Company' },
  { href: '#phases', label: 'Phases' },
  { href: '#timeline', label: 'Timeline' },
  { href: '#quickref', label: 'Quick Ref' },
];

export default function Navbar() {
  const router = useRouter();
  const scrolled = useNavScrolled();
  const activeId = useScrollActive(NAV_ITEMS.map((n) => n.href.replace('#', '')));
  const { isAuthenticated, user, logout } = useAuth();
  const { stats } = useProgress();
  const { theme, toggleTheme } = useTheme();

  const handleClick = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.logo}>MERU DATA — PREP HUB</div>
          <div className={styles.welcomeInfo}>
            <span className={styles.greeting}>
              Welcome back, <strong>{user?.name || 'User'}</strong>
            </span>
            {stats.streak > 0 && (
              <span className={styles.streak}>{stats.streak} day streak 🔥</span>
            )}
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.links}>
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`${styles.link} ${activeId === item.href.replace('#', '') ? styles.active : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleClick(item.href);
                }}
              >
                {item.label}
              </a>
            ))}
          </div>
          <button
            className={styles.themeBtn}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
