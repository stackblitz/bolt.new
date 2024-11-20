// PurpleRays.jsx
import React, { useEffect, useState } from 'react';
import styles from './styles.module.scss';

const BackgroundRays = () => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Initial theme
    const currentTheme = document.documentElement.getAttribute('data-theme');
    setTheme(currentTheme || 'dark');

    // Optional: Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme');
          setTheme((existingTheme) => newTheme || existingTheme);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);
  return (
    <div className={`${styles.rayContainer} `}>
      <div className={`${styles.lightRay} ${styles.ray1}`}></div>
      <div className={`${styles.lightRay} ${styles.ray2}`}></div>
      <div className={`${styles.lightRay} ${styles.ray3}`}></div>
      <div className={`${styles.lightRay} ${styles.ray4}`}></div>
      <div className={`${styles.lightRay} ${styles.ray5}`}></div>
      <div className={`${styles.lightRay} ${styles.ray6}`}></div>
      <div className={`${styles.lightRay} ${styles.ray7}`}></div>
      <div className={`${styles.lightRay} ${styles.ray8}`}></div>
    </div>
  );
};

export default BackgroundRays;
