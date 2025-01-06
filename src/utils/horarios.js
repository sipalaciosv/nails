// utils/horarios.js

/**
 * Calcula los rangos de tiempo disponibles excluyendo las citas ocupadas y el bloque de almuerzo.
 * @param {Date} horarioInicio - Inicio del horario de trabajo.
 * @param {Date} horarioFin - Fin del horario de trabajo.
 * @param {Array<Object>} citas - Lista de citas [{ horaInicio, horaFin }].
 * @param {Object} bloqueAlmuerzo - Bloque de almuerzo { start, end }.
 * @returns {Array<Object>} - Rangos de tiempo disponibles [{ start, end }].
 */
export const calcularRangosDisponibles = (horarioInicio, horarioFin, citas, bloqueAlmuerzo) => {
    let rangosDisponibles = [{ start: horarioInicio, end: horarioFin }];
  
    // Eliminar rangos ocupados por citas
    citas.forEach((cita) => {
      rangosDisponibles = rangosDisponibles.flatMap((rango) => {
        if (cita.horaInicio >= rango.end || cita.horaFin <= rango.start) {
          return [rango]; // No hay solapamiento
        }
  
        const nuevosRangos = [];
        if (cita.horaInicio > rango.start) {
          nuevosRangos.push({ start: rango.start, end: cita.horaInicio });
        }
        if (cita.horaFin < rango.end) {
          nuevosRangos.push({ start: cita.horaFin, end: rango.end });
        }
        return nuevosRangos;
      });
    });
  
    // Eliminar bloque de almuerzo
    rangosDisponibles = rangosDisponibles.flatMap((rango) => {
      if (bloqueAlmuerzo.start >= rango.end || bloqueAlmuerzo.end <= rango.start) {
        return [rango]; // No hay solapamiento con almuerzo
      }
  
      const nuevosRangos = [];
      if (bloqueAlmuerzo.start > rango.start) {
        nuevosRangos.push({ start: rango.start, end: bloqueAlmuerzo.start });
      }
      if (bloqueAlmuerzo.end < rango.end) {
        nuevosRangos.push({ start: bloqueAlmuerzo.end, end: rango.end });
      }
      return nuevosRangos;
    });
  
    return rangosDisponibles;
  };
  