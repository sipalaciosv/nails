import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db } from "./firebase"; // './' porque está en la misma carpeta que `populateCitas.js`


const citasDummy = (clientes) => [
  {
    idCliente: clientes[0]?.id,
    fecha: Timestamp.fromDate(new Date("2024-01-01T10:00:00")),
    servicio: "Manicure",
    precio: 15000,
    estado: "Pendiente",
    notas: "Prefiere tonos claros.",
  },
  {
    idCliente: clientes[1]?.id,
    fecha: Timestamp.fromDate(new Date("2024-01-02T14:00:00")),
    servicio: "Pedicure",
    precio: 20000,
    estado: "Confirmada",
    notas: "",
  },
  {
    idCliente: clientes[2]?.id,
    fecha: Timestamp.fromDate(new Date("2024-01-03T16:00:00")),
    servicio: "Uñas acrílicas",
    precio: 25000,
    estado: "Cancelada",
    notas: "Cliente pidió cambiar la cita.",
  },
  {
    idCliente: clientes[0]?.id,
    fecha: Timestamp.fromDate(new Date("2024-01-04T12:30:00")),
    servicio: "Reparación de uñas",
    precio: 12000,
    estado: "Confirmada",
    notas: "Reparación urgente.",
  },
  {
    idCliente: clientes[3]?.id || clientes[0]?.id, // Fallback si hay menos de 4 clientes
    fecha: Timestamp.fromDate(new Date("2024-01-05T15:00:00")),
    servicio: "Esmaltado permanente",
    precio: 18000,
    estado: "Pendiente",
    notas: "Quiere un diseño navideño.",
  },
];

const populateCitas = async () => {
  try {
    // Obtener todos los clientes de Firebase
    const querySnapshot = await getDocs(collection(db, "clientes"));
    const clientes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (clientes.length === 0) {
      console.log("No hay clientes en la colección.");
      return;
    }

    // Generar citas usando los clientes obtenidos
    const citas = citasDummy(clientes);

    for (const cita of citas) {
      if (cita.idCliente) {
        await addDoc(collection(db, "citas"), cita);
        console.log(`Cita agregada: ${JSON.stringify(cita)}`);
      } else {
        console.warn("No se pudo agregar una cita porque faltan clientes.");
      }
    }

    console.log("Población de citas completada.");
  } catch (error) {
    console.error("Error al poblar las citas:", error);
  }
};

populateCitas();
