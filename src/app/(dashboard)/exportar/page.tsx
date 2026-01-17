"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { FileDown, Table, Users, BarChart3, ChevronLeft } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Costalero {
    id: string;
    nombre: string;
    apellidos: string;
    trabajadera: number;
    puesto: string;
    altura: number | null;
    suplemento: number | null;
}

interface EventoStats {
    id: string;
    titulo: string;
    fecha_inicio: string;
    presentes: number;
    ausentes: number;
    justificados: number;
    total: number;
}

export default function ExportarDatos() {
    const router = useRouter();
    const [costaleros, setCostaleros] = useState<Costalero[]>([]);
    const [eventosStats, setEventosStats] = useState<EventoStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [temporadaActiva, setTemporadaActiva] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            // Fetch active season
            const { data: temporadas } = await supabase
                .from("temporadas")
                .select("*")
                .eq("activa", true)
                .single();

            if (temporadas) {
                setTemporadaActiva(temporadas.nombre);
            }

            // Fetch costaleros (excluding staff roles)
            const { data: costalerosData } = await supabase
                .from("costaleros")
                .select("*")
                .eq("rol", "costalero")
                .order("trabajadera")
                .order("apellidos");

            if (costalerosData) {
                setCostaleros(costalerosData);
            }

            // Fetch eventos with attendance stats
            const { data: eventos } = await supabase
                .from("eventos")
                .select("*")
                .order("fecha_inicio", { ascending: false });

            if (eventos) {
                const statsPromises = eventos.map(async (evento) => {
                    const { data: asistencias } = await supabase
                        .from("asistencias")
                        .select("estado")
                        .eq("evento_id", evento.id);

                    const presentes = asistencias?.filter(a => a.estado === 'presente').length || 0;
                    const ausentes = asistencias?.filter(a => a.estado === 'ausente').length || 0;
                    const justificados = asistencias?.filter(a => a.estado === 'justificado' || a.estado === 'justificada').length || 0;

                    return {
                        id: evento.id,
                        titulo: evento.titulo,
                        fecha_inicio: evento.fecha_inicio,
                        presentes,
                        ausentes,
                        justificados,
                        total: presentes + ausentes + justificados
                    };
                });

                const stats = await Promise.all(statsPromises);
                setEventosStats(stats);
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    // --- CSV EXPORTS ---
    const exportCostalerosCSV = () => {
        const headers = ["Nombre", "Apellidos", "Trabajadera", "Puesto", "Altura (m)", "Suplemento (cm)"];
        const rows = costaleros.map(c => [
            c.nombre,
            c.apellidos,
            c.trabajadera,
            c.puesto,
            c.altura || "-",
            c.suplemento || "-"
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(";") + "\n"
            + rows.map(e => e.join(";")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `listado_cuadrilla_${temporadaActiva || 'export'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportEstadisticasCSV = () => {
        const headers = ["Evento", "Fecha", "Presentes", "Ausentes", "Justificados", "Total Registrados"];
        const rows = eventosStats.map(e => [
            e.titulo,
            new Date(e.fecha_inicio).toLocaleDateString('es-ES'),
            e.presentes,
            e.ausentes,
            e.justificados,
            e.total
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(";") + "\n"
            + rows.map(r => r.join(";")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `estadisticas_${temporadaActiva || 'export'}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- PDF EXPORTS ---
    const exportCostalerosPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Listado de Cuadrilla", 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Temporada ${temporadaActiva || '-'} - Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 28);

        const tableRows = costaleros.map(c => [
            `${c.nombre} ${c.apellidos}`,
            String(c.trabajadera),
            c.puesto,
            c.altura ? `${c.altura}m` : '-',
            c.suplemento ? `${c.suplemento}cm` : '-'
        ]);

        autoTable(doc, {
            head: [["Nombre Completo", "Trab.", "Puesto", "Altura", "Supl."]],
            body: tableRows,
            startY: 35,
            theme: 'grid',
            headStyles: { fillColor: [0, 128, 90], textColor: 255 },
            styles: { fontSize: 9 }
        });

        doc.save(`listado_cuadrilla_${temporadaActiva || 'export'}.pdf`);
    };

    const exportEstadisticasPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Estadisticas de Asistencia", 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Temporada ${temporadaActiva || '-'} - Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, 28);

        const tableRows = eventosStats.map(e => [
            e.titulo,
            new Date(e.fecha_inicio).toLocaleDateString('es-ES'),
            String(e.presentes),
            String(e.ausentes),
            String(e.justificados),
            String(e.total)
        ]);

        autoTable(doc, {
            head: [["Evento", "Fecha", "Pres.", "Aus.", "Just.", "Total"]],
            body: tableRows,
            startY: 35,
            theme: 'grid',
            headStyles: { fillColor: [23, 23, 23], textColor: 255 },
            styles: { fontSize: 9 }
        });

        doc.save(`estadisticas_${temporadaActiva || 'export'}.pdf`);
    };

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
        </div>
    );

    return (
        <div className="p-6 space-y-8 pb-32 animate-in fade-in duration-700 bg-background min-h-screen">
            {/* Header */}
            <header className="relative flex items-center justify-center min-h-[64px]">
                <button
                    onClick={() => router.back()}
                    className="absolute left-0 p-3 bg-white shadow-sm border border-black/5 rounded-2xl text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="text-center">
                    <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">Exportar Datos</h1>
                    {temporadaActiva && (
                        <p className="text-[10px] text-primary font-black uppercase tracking-widest">Temporada {temporadaActiva}</p>
                    )}
                </div>
            </header>

            {/* Costaleros Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 rounded-2xl">
                        <Users size={24} className="text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-neutral-900 uppercase tracking-tight">Listado de Cuadrilla</h2>
                        <p className="text-xs text-neutral-400 font-medium">{costaleros.length} costaleros registrados</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        onClick={exportCostalerosCSV}
                        className="h-16 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg"
                    >
                        <Table size={20} />
                        <span className="text-[10px] uppercase tracking-widest">CSV (Excel)</span>
                    </Button>
                    <Button
                        onClick={exportCostalerosPDF}
                        className="h-16 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg"
                    >
                        <FileDown size={20} />
                        <span className="text-[10px] uppercase tracking-widest">PDF</span>
                    </Button>
                </div>
            </section>

            <div className="h-px bg-black/5" />

            {/* Estadisticas Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-100 rounded-2xl">
                        <BarChart3 size={24} className="text-amber-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-neutral-900 uppercase tracking-tight">Estadísticas de Asistencia</h2>
                        <p className="text-xs text-neutral-400 font-medium">{eventosStats.length} eventos registrados</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        onClick={exportEstadisticasCSV}
                        className="h-16 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg"
                    >
                        <Table size={20} />
                        <span className="text-[10px] uppercase tracking-widest">CSV (Excel)</span>
                    </Button>
                    <Button
                        onClick={exportEstadisticasPDF}
                        className="h-16 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg"
                    >
                        <FileDown size={20} />
                        <span className="text-[10px] uppercase tracking-widest">PDF</span>
                    </Button>
                </div>
            </section>

            {/* Summary Preview */}
            <section className="bg-white p-5 rounded-[24px] border border-black/5 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase text-neutral-400 tracking-widest">Vista Rápida</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-neutral-50 rounded-2xl">
                        <p className="text-3xl font-black text-primary">{costaleros.length}</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">Costaleros</p>
                    </div>
                    <div className="p-4 bg-neutral-50 rounded-2xl">
                        <p className="text-3xl font-black text-neutral-900">{eventosStats.length}</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">Eventos</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
