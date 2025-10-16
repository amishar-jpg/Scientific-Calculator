import styles from './Display.module.css';

const Display = ({ expression="" }) => {
  return (
    <input type="text" className={styles.display} placeholder='0' value={expression} readOnly />
  );
};

export default Display;