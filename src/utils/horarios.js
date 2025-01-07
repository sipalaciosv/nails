/**
 * Calcula las horas específicas disponibles basadas en rangos fijos y citas ocupadas.
 * @param {Array<Object>} citas - Lista de citas [{ horaInicio, horaFin }].
 * @param {Array<Object>} horasFijas - Lista de horas fijas [{ hora, rangoInicio, rangoFin }].
 * @returns {Array<string>} - Lista de horas disponibles ["11:00", "16:00", "19:00"].
 */
export const calcularHorasDisponibles = (citas, horasFijas) => {
  return horasFijas
    .filter(({ rangoInicio, rangoFin }) => {
      // Verificar si alguna cita ocupa el rango asociado a la hora fija
      const estaOcupado = citas.some(
        (cita) =>
          cita.horaInicio < rangoFin && cita.horaFin > rangoInicio // Solapamiento
      );
      return !estaOcupado; // Incluir solo las horas no ocupadas
    })
    .map(({ hora }) => hora); // Devolver solo las horas disponibles
};
