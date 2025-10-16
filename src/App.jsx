import styles from './App.module.css';
import Display from './components/Display';
import ButtonContainer from './components/ButtonContainer';
import Heading from './components/Heading';
import { useState } from 'react';

function App() {
  const [expression, setExpression] = useState("0");
  const [loading, setLoading] = useState(false);

  const handleButtonClick = (value) => {
    if (value === 'AC') {
      handleClear();
      return;
    }

    if (value === 'CE') {
      setExpression((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
      return;
    }

    if (value === '=') {
      handleEvaluate();
      return;
    }

    // append clicked button value
    setExpression((prev) => (prev === "0" ? value : prev + value));
  };

  const handleClear = () => {
    setExpression("0");
  };

  const handleEvaluate = async () => {
    if (!expression.trim() || loading) return;

    setLoading(true);
    setExpression("Calculating...");

    try {
      const response = await fetch("https://api.x.ai/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_GROK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "grok-2",
          input: `Solve this math equation: ${expression}`,
        }),
      });

      const data = await response.json();

      // Extract result text safely
      const result = data.output?.[0]?.content?.[0]?.text || "Error";

      setExpression(result);
    } catch (error) {
      console.error("Error:", error);
      setExpression("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.calculator}>
      <Heading />
      <Display expression={expression} />
      <ButtonContainer onButtonClick={handleButtonClick} />
    </div>
  );
}

export default App;
