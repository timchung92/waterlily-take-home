import React, { useState, useEffect } from 'react';

interface AnimatedTextProps {
  text: string;
  delay?: number; // delay in milliseconds
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ text, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [delay]);

  return (
    <span className={`text-animate ${isVisible ? 'visible' : ''}`}>{text}</span>
  );
};

export default AnimatedText;
