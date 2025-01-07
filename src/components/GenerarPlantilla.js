"use client";

import { useEffect, useRef } from "react";

export default function GenerarPlantilla({ disponibilidadSemanal, mes }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const loadFontAndDraw = () => {
      document.fonts.ready.then(() => {
        const plantilla = new Image();
        plantilla.src = "/plantilla2.png"; // Ruta a tu plantilla
        plantilla.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar canvas
          ctx.drawImage(plantilla, 0, 0, canvas.width, canvas.height);

          // Configuración de texto
          ctx.fillStyle = "#000";

          // Dibujar el mes
          ctx.font = "20px 'Montserrat'";
          ctx.textAlign = "center";
          ctx.fillText(
            mes.charAt(0).toUpperCase() + mes.slice(1),
            100,
            190 // Coordenada Y
          );

          // Ajustes para cada fila
          const xDia = 40;
          const xFecha = 130;
          const xHorarios = 210;
          let yPos = 250;

          ctx.font = "16px 'Montserrat'"; // Usar Montserrat para días y horarios
          disponibilidadSemanal.forEach((dia) => {
            ctx.textAlign = "left";
            ctx.fillText(dia.dia, xDia, yPos); // Día
            ctx.fillText(dia.fecha.toString().padStart(2, "0"), xFecha, yPos); // Fecha
            // Verificar si hay horarios disponibles
            if (dia.horarios.length > 0) {
              ctx.fillText(dia.horarios.join(" | "), xHorarios, yPos); // Horarios
            } else {
              ctx.fillText("           Horas agotadas para este día", xHorarios, yPos); // Texto alternativo
            }
            ctx.fillText(dia.horarios.join(" | "), xHorarios, yPos); // Horarios
            yPos += 60; // Incrementar la posición vertical
          });

          // Dibujar datos de contacto
          ctx.textAlign = "center";
          ctx.font = "16px 'Montserrat'";
          ctx.fillText("", canvas.width / 4, canvas.height - 50);
          ctx.fillText("", (3 * canvas.width) / 4, canvas.height - 50);
        };
      });
    };

    loadFontAndDraw();
  }, [disponibilidadSemanal, mes]);
  // Función para descargar la imagen
  const handleDownload = () => {
    const canvas = canvasRef.current;
  
    // Generar un nombre único usando la fecha y hora actual
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-"); // Formato: AAAA-MM-DDTHH-MM-SS
    const fileName = `disponibilidad_${mes}_${timestamp}.png`;
  
    const link = document.createElement("a");
    link.download = fileName; // Nombre único para el archivo
    link.href = canvas.toDataURL("image/png"); // Convierte el canvas a una URL de imagen
    link.click(); // Dispara la descarga
  };
  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <canvas ref={canvasRef} width="600" height="800" style={{ border: "1px solid #ccc" }}></canvas>
      <button onClick={handleDownload} className="btn-crear mt-3" >
        Descargar Imagen
      </button>
    </div>
  );
}
