import { useState, useEffect } from "react";

export const LiveClock = () => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const istanbul = new Intl.DateTimeFormat("tr-TR", {
        timeZone: "Europe/Istanbul",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now);
      setTime(istanbul);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      style={{
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: "11px",
        letterSpacing: "0.1em",
        color: "rgb(var(--text-primary-rgb) / 0.3)",
      }}
    >
      IST {time}
    </span>
  );
};
