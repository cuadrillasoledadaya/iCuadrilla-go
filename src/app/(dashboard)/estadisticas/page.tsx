"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { FileDown, Table, Users, BarChart3, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function EstadisticasExport() {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { data: costaleros } = await supabase.from("costaleros").select("*");
        if (costaleros) setData(costaleros);
    };

    const exportCSV = () => {
        const headers = ["Nombre", "Apellidos", "Trabajadera", "Puesto", "Altura"];
        const rows = data.map(c => [c.nombre, c.apellidos, c.trabajadera, c.puesto, c.altura]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "listado_igualá.csv");
        document.body.appendChild(link);
        link.click();
    };

    const exportPDF = () => {
        const doc = new jsPDF() as any;
        doc.text("Listado de Igualá - iCuadrilla", 14, 15);

        const tableRows = data.map(c => [c.nombre, c.apellidos, c.trabajadera, c.puesto, c.altura]);

        doc.autoTable({
            head: [["Nombre", "Apellidos", "Trab.", "Puesto", "Alt."]],
            body: tableRows,
            startY: 20,
            theme: 'striped'
        });

        doc.save("listado_igualá.pdf");
    };

    const router = useRouter();

    return (
        <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-700 bg-background min-h-screen">
            <header className="relative flex items-center justify-center min-h-[64px]">
                <button
                    onClick={() => router.back()}
                    className="absolute left-0 p-3 bg-neutral-900 shadow-sm border border-neutral-800 rounded-2xl text-neutral-400 hover:text-white transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center space-y-0.5">
                    <h1 className="text-2xl font-black uppercase tracking-tight text-white">Estadísticas</h1>
                    <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Exportación de Datos</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 flex flex-col items-center justify-center space-y-4">
                    <Table size={40} className="text-blue-400" />
                    <h3 className="font-bold text-white">Exportar a CSV (Excel)</h3>
                    <Button onClick={exportCSV} className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                        <FileDown size={16} className="mr-2" /> Descargar CSV
                    </Button>
                </div>

                <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 flex flex-col items-center justify-center space-y-4">
                    <FileDown size={40} className="text-red-400" />
                    <h3 className="font-bold text-white">Generar Listado PDF</h3>
                    <Button onClick={exportPDF} className="bg-red-600 hover:bg-red-700 text-white w-full">
                        <FileDown size={16} className="mr-2" /> Descargar PDF
                    </Button>
                </div>
            </div>

            <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                <h3 className="text-xs font-bold uppercase text-neutral-500 mb-4">Resumen de Cuadrilla</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-neutral-900 rounded border border-neutral-800">
                        <p className="text-2xl font-bold text-white">{data.length}</p>
                        <p className="text-[10px] text-neutral-500 uppercase">Costaleros Totales</p>
                    </div>
                    <div className="p-4 bg-neutral-900 rounded border border-neutral-800">
                        <p className="text-2xl font-bold text-white">{data.filter(c => c.puesto === 'Patero').length}</p>
                        <p className="text-[10px] text-neutral-500 uppercase">Pateros</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
