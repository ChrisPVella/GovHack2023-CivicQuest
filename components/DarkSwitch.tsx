import React, { useState, useEffect } from "react";

const ThemeChanger = () => {
  const [mounted, setMounted] = useState(false);

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="flex items-center">
    </div>
  );
};

export default ThemeChanger;
