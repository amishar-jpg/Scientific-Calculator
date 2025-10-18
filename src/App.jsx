import styles from './App.module.css';
import Display from './components/Display';
import ButtonContainer from './components/ButtonContainer';
import Heading from './components/Heading';
import { useState } from 'react';

function App() {
  const [expression, setExpression] = useState("0");
  const [loading, setLoading] = useState(false);

  // Helper: strip simple markdown and normalize
  const stripMarkdown = (s) => {
    if (typeof s !== 'string') return s;
    return s.replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/__(.*?)__/g, '$1')
            .replace(/`(.*?)`/g, '$1')
            .replace(/\s+/g, ' ')
            .trim();
  };

  // Helper: robustly extract assistant text from response object
  const extractAssistantText = (data) => {
    if (!data || typeof data !== 'object') return null;

    // 1) top-level text
    if (typeof data.text === 'string') return stripMarkdown(data.text);

    // 2) output array -> content items
    if (Array.isArray(data.output)) {
      for (const out of data.output) {
        // direct text on output
        if (typeof out.text === 'string') return stripMarkdown(out.text);

        const contents = Array.isArray(out.content) ? out.content : [];
        for (const c of contents) {
          if (typeof c === 'string') return stripMarkdown(c);
          if (c && typeof c === 'object') {
            if (typeof c.text === 'string') return stripMarkdown(c.text);
            // nested content
            if (Array.isArray(c.content)) {
              for (const cc of c.content) {
                if (typeof cc === 'string') return stripMarkdown(cc);
                if (cc && typeof cc === 'object' && typeof cc.text === 'string') return stripMarkdown(cc.text);
              }
            }
          }
        }
      }
    }

    // 3) shallow search for any 'text' property
    const queue = [data];
    while (queue.length) {
      const node = queue.shift();
      if (!node || typeof node !== 'object') continue;
      for (const k of Object.keys(node)) {
        const v = node[k];
        if (typeof v === 'string' && k.toLowerCase().includes('text')) return stripMarkdown(v);
        if (typeof v === 'string' && /\d+\s*-\s*\d+\s*=/.test(v)) return stripMarkdown(v);
        if (v && typeof v === 'object') queue.push(v);
      }
    }

    return null;
  };

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
      const response = await fetch("https://api.groq.com/openai/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_GROK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "moonshotai/kimi-k2-instruct-0905",
          input: `Solve this math equation: ${expression}`,
        }),
      });

  const data = await response.json();

  console.log("API Response:", data);

  const extracted = extractAssistantText(data);
  console.log('Extracted assistant text:', extracted);

  setExpression(extracted || "Error");
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
