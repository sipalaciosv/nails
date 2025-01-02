"use client";

import { createContext, useState, useContext } from "react";

const BackgroundContext = createContext();

export function BackgroundProvider({ children }) {
  const fondos = [
    "/images/opc1.jpg",
    "/images/opc2.jpg",
    "/images/opc3.avif",
    "/images/opc4.jpg",
  ];
  const [background, setBackground] = useState(fondos[0]);

  const cambiarFondo = () => {
    const currentIndex = fondos.indexOf(background);
    const nextIndex = (currentIndex + 1) % fondos.length;
    setBackground(fondos[nextIndex]);
  };

  return (
    <BackgroundContext.Provider value={{ background, cambiarFondo }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  return useContext(BackgroundContext);
}
