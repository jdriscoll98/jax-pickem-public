import { useState, useEffect } from "react";

export function useCountdown(endTime: number) {
  const [timeLeft, setTimeLeft] = useState(
    endTime ? Math.floor((endTime - Date.now()) / 1000) : 0
  );
  useEffect(() => {
    const interval = setInterval(() => {
      if (!endTime) return;
      const seconds = Math.floor((endTime - Date.now()) / 1000);
      setTimeLeft(seconds);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const daysLeft = Math.floor(timeLeft / 86400);
  const hoursLeft = Math.floor((timeLeft % 86400) / 3600);
  const minutesLeft = Math.floor((timeLeft % 3600) / 60);
  const secondsLeft = timeLeft % 60;

  return `
    ${daysLeft.toString().padStart(2, "0")}:${hoursLeft
    .toString()
    .padStart(2, "0")}:${minutesLeft.toString().padStart(2, "0")}:${secondsLeft
    .toString()
    .padStart(2, "0")}`;
}
