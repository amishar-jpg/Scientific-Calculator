import styles from './ButtonContainer.module.css';

const ButtonContainer = ({ onButtonClick }) => {

  const buttonNames = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', '=', '+','sin','cos','tan','log','ln','^','(',')','e','π','CE','AC'
  ];

  const handleClick = (event) => {
    const value = event.currentTarget.value;
    if (typeof onButtonClick === 'function') onButtonClick(value);
  };

  return (
    <div className={styles.buttonContainer}>
      {buttonNames.map((name) => (
        <button
          key={name}
          className={styles.button}
          onClick={handleClick}
          value={name}
          type="button"
        >
          {name}
        </button>
      ))}
    </div>
  );
};

export default ButtonContainer;
