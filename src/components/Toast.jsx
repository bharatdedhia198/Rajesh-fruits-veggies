import { useEffect, useState } from "react";

export default function Toast({ message, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 300); }, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`toast ${visible ? "toast-in" : "toast-out"}`}>
      <span>🛒</span> {message}
    </div>
  );
}
