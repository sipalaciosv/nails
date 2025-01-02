import Calendario from "@/components/Calendario";
import Navbar from "@/components/Navbar";

export default function Page() {
  return (
    <div>
      <Navbar />
      <div className="container py-4">
        <Calendario />
      </div>
    </div>
  );
}
