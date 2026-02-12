"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { FileDown, Table, Users, BarChart3, ChevronLeft, QrCode } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';
import QRCodeLib from 'qrcode';

interface Costalero {
    id: string;
    nombre: string;
    apellidos: string;
    trabajadera: number;
    puesto: string;
    altura: number | null;
    suplemento: number | null;
    qr_code: string;
}

interface EventoStats {
    id: string;
    titulo: string;
    fecha_inicio: string;
    estado: string;
    presentes: number;
    ausentes: number;
    justificados: number;
    total: number;
    asistencias: {
        costalero_id: string;
        nombre: string;
        apellidos: string;
        trabajadera: number;
        puesto: string;
        suplemento: number | null;
        estado: string;
    }[];
}

export default function ExportarDatos() {
    const router = useRouter();
    const [costaleros, setCostaleros] = useState<Costalero[]>([]);
    const [eventosStats, setEventosStats] = useState<EventoStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEventId, setSelectedEventId] = useState<string>("");
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

            // Fetch eventos ONLY for active season
            if (temporadas?.id) {
                const { data: eventos } = await supabase
                    .from("eventos")
                    .select("*")
                    .eq("temporada_id", temporadas.id)
                    .order("fecha_inicio", { ascending: false });

                if (eventos && costalerosData) {
                    const statsPromises = eventos.map(async (evento) => {
                        const { data: asistencias } = await supabase
                            .from("asistencias")
                            .select("costalero_id, estado")
                            .eq("evento_id", evento.id);

                        const detailedAsistencias = (asistencias || []).map(a => {
                            const costalero = costalerosData.find(c => c.id === a.costalero_id);
                            return {
                                costalero_id: a.costalero_id,
                                nombre: costalero?.nombre || 'Desconocido',
                                apellidos: costalero?.apellidos || '',
                                trabajadera: costalero?.trabajadera || 0,
                                puesto: costalero?.puesto || '-',
                                suplemento: costalero?.suplemento || null,
                                estado: a.estado
                            };
                        }).sort((a, b) => a.trabajadera - b.trabajadera || a.apellidos.localeCompare(b.apellidos));

                        const presentes = detailedAsistencias.filter(a => a.estado === 'presente').length;
                        const ausentes = detailedAsistencias.filter(a => a.estado === 'ausente').length;
                        const justificados = detailedAsistencias.filter(a => a.estado === 'justificado' || a.estado === 'justificada').length;

                        return {
                            id: evento.id,
                            titulo: evento.titulo,
                            fecha_inicio: evento.fecha_inicio,
                            estado: evento.estado,
                            presentes,
                            ausentes,
                            justificados,
                            total: presentes + ausentes + justificados,
                            asistencias: detailedAsistencias
                        };
                    });

                    const stats = await Promise.all(statsPromises);
                    setEventosStats(stats);
                }
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    // --- SHARED EXPORT HANDLER ---
    const handleExport = async (blob: Blob, filename: string) => {
        // Detect if it's a mobile device using userAgent
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // --- PC FLOW: DIRECT DOWNLOAD (Skip sharing entirely) ---
        if (!isMobile) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            return;
        }

        // --- MOBILE FLOW: Try native share, fallback to download ---
        try {
            const file = new File([blob], filename, { type: blob.type });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: filename,
                    text: `Reporte iCuadrilla: ${filename}`
                });
                return; // Successfully shared
            }
        } catch (error) {
            console.log("Sharing cancelled or failed, falling back to download", error);
        }

        // Fallback for mobile if share fails or is not available
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // --- CSV EXPORTS ---
    const generateAndExportCSV = (content: string, filename: string) => {
        // Manual UTF-8 BOM bytes: EF BB BF
        const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const encoder = new TextEncoder();
        const contentBytes = encoder.encode(content);

        // Combine BOM + content
        const combined = new Uint8Array(BOM.length + contentBytes.length);
        combined.set(BOM, 0);
        combined.set(contentBytes, BOM.length);

        const blob = new Blob([combined], { type: 'text/csv' });
        handleExport(blob, filename);
    };

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

        const csvContent = headers.join(";") + "\n" + rows.map(e => e.join(";")).join("\n");
        generateAndExportCSV(csvContent, `listado_cuadrilla_${temporadaActiva || 'export'}.csv`);
    };

    const generateEstadisticasCSV = (eventsToExport: EventoStats[]) => {
        let csvContent = "";

        eventsToExport.forEach((evento, index) => {
            if (index > 0) csvContent += "\n\n\n"; // Triple line break between events

            // === Event Title as Section Header ===
            csvContent += `=== ${evento.titulo.toUpperCase()} ===\n`;
            csvContent += `Estado: ${evento.estado}\n`;
            csvContent += `Fecha: ${new Date(evento.fecha_inicio).toLocaleDateString('es-ES')}\n`;
            csvContent += `Hora: ${new Date(evento.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}\n`;
            csvContent += `Presentes: ${evento.presentes} | Ausentes: ${evento.ausentes} | Justificados: ${evento.justificados}\n\n`;

            // Table headers
            csvContent += "Nombre;Apellidos;Trabajadera;Puesto;Suplemento;Estado\n";

            // Rows
            evento.asistencias.forEach(a => {
                csvContent += `${a.nombre};${a.apellidos};${a.trabajadera};${a.puesto};${a.suplemento || '-'};${a.estado}\n`;
            });
        });
        return csvContent;
    };

    // --- EXCEL EXPORT (MULTI-SHEET) ---
    const generateEstadisticasExcel = (eventsToExport: EventoStats[], filename: string) => {
        const workbook = XLSX.utils.book_new();

        eventsToExport.forEach((evento) => {
            // Create header rows for each sheet
            const headerData = [
                [`${evento.titulo.toUpperCase()}`],
                [`Estado: ${evento.estado}`],
                [`Fecha: ${new Date(evento.fecha_inicio).toLocaleDateString('es-ES')}`],
                [`Hora: ${new Date(evento.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`],
                [`Presentes: ${evento.presentes} | Ausentes: ${evento.ausentes} | Justificados: ${evento.justificados}`],
                [], // Empty row
                ['Nombre', 'Apellidos', 'Trabajadera', 'Puesto', 'Suplemento', 'Estado'] // Table headers
            ];

            // Add data rows
            const dataRows = evento.asistencias.map(a => [
                a.nombre,
                a.apellidos,
                a.trabajadera,
                a.puesto,
                a.suplemento || '-',
                a.estado
            ]);

            // Combine header and data
            const sheetData = [...headerData, ...dataRows];

            // Create worksheet
            const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

            // Sanitize sheet name (Excel has restrictions)
            let sheetName = evento.titulo.substring(0, 31); // Max 31 chars
            sheetName = sheetName.replace(/[:\\/?*\[\]]/g, '_'); // Remove invalid chars

            // Add sheet to workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        });

        // Generate Excel file and trigger download
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        handleExport(blob, filename);
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

        // Use helper instead of doc.save
        const blob = doc.output('blob');
        handleExport(blob, `listado_cuadrilla_${temporadaActiva || 'export'}.pdf`);
    };

    const exportCostalerosExtendidoPDF = () => {
        const doc = new jsPDF();

        // --- PÁGINA 1+: DATOS REALES ---
        doc.setFontSize(18);
        doc.text("Listado Cuadrilla Extendido", 14, 20);
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

        // --- ÚLTIMA PÁGINA: PLANTILLA VACÍA ---
        doc.addPage();
        doc.setFontSize(18);
        doc.setTextColor(0);
        doc.text("Plantilla para Anotaciones", 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Estructura vacía para completar a mano`, 14, 28);

        // Generamos filas vacías (aprox 20 filas para que quepan bien)
        const blankRows = Array(20).fill(["", "", "", "", ""]);

        autoTable(doc, {
            head: [["Nombre Completo", "Trab.", "Puesto", "Altura", "Supl."]],
            body: blankRows,
            startY: 35,
            theme: 'grid',
            headStyles: { fillColor: [70, 70, 70], textColor: 255 },
            styles: {
                fontSize: 9,
                minCellHeight: 11 // Más altas para facilitar escribir a mano
            }
        });

        const blob = doc.output('blob');
        handleExport(blob, `listado_extendido_${temporadaActiva || 'export'}.pdf`);
    };

    const generateEstadisticasPDF = (eventsToExport: EventoStats[], filename: string) => {
        const doc = new jsPDF();
        let yPos = 15;

        eventsToExport.forEach((evento, index) => {
            // Check if we need a new page (rough estimate)
            if (yPos > 240) {
                doc.addPage();
                yPos = 15;
            }

            // Event Header Box
            doc.setFillColor(23, 23, 23);
            doc.rect(14, yPos, 182, 28, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.text(evento.titulo.toUpperCase(), 18, yPos + 10);

            doc.setFontSize(9);
            doc.text(`Estado: ${evento.estado} | Fecha: ${new Date(evento.fecha_inicio).toLocaleDateString('es-ES')} | Hora: ${new Date(evento.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`, 18, yPos + 18);
            doc.text(`Pres: ${evento.presentes} | Aus: ${evento.ausentes} | Just: ${evento.justificados}`, 18, yPos + 24);

            // Table data
            const tableRows = evento.asistencias.map(a => [
                `${a.nombre} ${a.apellidos}`,
                String(a.trabajadera),
                a.puesto,
                a.suplemento ? `${a.suplemento}cm` : '-',
                a.estado.toUpperCase()
            ]);

            autoTable(doc, {
                head: [["Nombre", "Trab.", "Puesto", "Supl.", "Estado"]],
                body: tableRows,
                startY: yPos + 32,
                theme: 'striped',
                headStyles: { fillColor: [0, 128, 90], textColor: 255, fontSize: 8 },
                styles: { fontSize: 8 },
                margin: { left: 14, right: 14 }
            });

            yPos = (doc as any).lastAutoTable.finalY + 15;

            // Add page break between events if multiple and not the last one
            if (index < eventsToExport.length - 1 && yPos > 240) {
                doc.addPage();
                yPos = 15;
            }
        });

        // Use helper instead of doc.save
        const blob = doc.output('blob');
        handleExport(blob, filename);
    };

    // --- QR CODE EXPORT ---
    const exportQRCodesPDF = async () => {
        const doc = new jsPDF();

        // Group costaleros by trabajadera
        const trabajaderasGroups: { [key: number]: typeof costaleros } = {};
        costaleros.forEach(c => {
            if (!trabajaderasGroups[c.trabajadera]) {
                trabajaderasGroups[c.trabajadera] = [];
            }
            trabajaderasGroups[c.trabajadera].push(c);
        });

        // Sort trabajaderas
        const sortedTrabajaderas = Object.keys(trabajaderasGroups).map(Number).sort((a, b) => a - b);

        let yPos = 20;
        let isFirstPage = true;

        for (const trabajaderaNum of sortedTrabajaderas) {
            const costalerosList = trabajaderasGroups[trabajaderaNum];

            // Trabajadera header
            if (!isFirstPage || yPos > 20) {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }
            }

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`TRABAJADERA ${trabajaderaNum}`, 105, yPos, { align: 'center' });
            yPos += 10;

            // QR Codes grid (2 columns)
            let col = 0;
            const qrSize = 50; // Increased from 35 to 50mm for better scanning
            const colWidth = 100;
            const rowHeight = 65; // Increased to accommodate larger QR

            for (const costalero of costalerosList) {
                // Check if we need a new page
                if (yPos + rowHeight > 270) { // Adjusted threshold
                    doc.addPage();
                    yPos = 20;
                    col = 0;
                }

                const xPos = col === 0 ? 10 : 110;

                try {
                    // Generate QR code as Data URL with higher quality
                    // CRITICAL: Use qr_code field, not id - this matches the costalero's profile QR
                    const qrDataUrl = await QRCodeLib.toDataURL(costalero.qr_code, {
                        width: 400, // Increased from 200 for better quality
                        margin: 2,   // Increased margin
                        errorCorrectionLevel: 'H' // Highest error correction
                    });

                    // Add QR code image
                    doc.addImage(qrDataUrl, 'PNG', xPos, yPos, qrSize, qrSize);

                    // Add costalero name below QR
                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'normal');
                    const fullName = `${costalero.nombre} ${costalero.apellidos}`;
                    doc.text(fullName, xPos + qrSize / 2, yPos + qrSize + 5, { align: 'center', maxWidth: qrSize });

                    // Add puesto
                    doc.setFontSize(8);
                    doc.setTextColor(100);
                    doc.text(costalero.puesto, xPos + qrSize / 2, yPos + qrSize + 10, { align: 'center', maxWidth: qrSize });
                    doc.setTextColor(0);

                } catch (error) {
                    console.error(`Error generating QR for ${costalero.nombre}:`, error);
                }

                col++;
                if (col >= 2) {
                    col = 0;
                    yPos += rowHeight;
                }
            }

            // Move to next trabajadera
            if (col !== 0) {
                yPos += rowHeight;
            }
            yPos += 10; // Extra space between trabajaderas
            isFirstPage = false;
        }

        const today = new Date();
        const dateStr = `${today.getDate().toString().padStart(2, '0')}_${(today.getMonth() + 1).toString().padStart(2, '0')}_${today.getFullYear()}`;

        const blob = doc.output('blob');
        handleExport(blob, `codigos_qr_cuadrilla_${dateStr}.pdf`);
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
                {/* Nueva exportación extendida */}
                <Button
                    onClick={exportCostalerosExtendidoPDF}
                    className="w-full h-16 bg-white border-2 border-dashed border-neutral-200 hover:border-primary/50 text-neutral-600 hover:text-primary font-black rounded-2xl flex items-center justify-center gap-3 transition-all group"
                >
                    <div className="p-2 bg-neutral-50 rounded-lg group-hover:bg-primary/5 transition-colors">
                        <FileDown size={18} />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] uppercase tracking-[0.2em] leading-none mb-1">Listado Cuadrilla</p>
                        <p className="text-sm uppercase tracking-tighter italic">Extendido (Con Hojas en Blanco)</p>
                    </div>
                </Button>
            </section>

            <div className="h-px bg-black/5" />

            {/* QR Codes Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-2xl">
                        <QrCode size={24} className="text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-neutral-900 uppercase tracking-tight">Códigos QR</h2>
                        <p className="text-xs text-neutral-400 font-medium">Exportar todos los QR por trabajaderas</p>
                    </div>
                </div>
                <Button
                    onClick={exportQRCodesPDF}
                    className="w-full h-16 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-lg"
                >
                    <QrCode size={20} />
                    <span className="text-sm uppercase tracking-widest">Descargar PDF con QR Codes</span>
                </Button>
            </section>

            <div className="h-px bg-black/5" />

            {/* Estadisticas Global Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-100 rounded-2xl">
                        <BarChart3 size={24} className="text-amber-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-neutral-900 uppercase tracking-tight">Estadísticas Totales</h2>
                        <p className="text-xs text-neutral-400 font-medium">{eventosStats.length} eventos (Reporte Global)</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        onClick={() => {
                            const today = new Date();
                            const dateStr = `${today.getDate().toString().padStart(2, '0')}_${(today.getMonth() + 1).toString().padStart(2, '0')}_${today.getFullYear()}`;
                            generateEstadisticasExcel(eventosStats, `estadistica_global_${dateStr}.xlsx`);
                        }}
                        className="h-16 bg-neutral-900 hover:bg-black text-white font-black rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg"
                    >
                        <Table size={20} />
                        <span className="text-[10px] uppercase tracking-widest">Excel</span>
                    </Button>
                    <Button
                        onClick={() => {
                            const today = new Date();
                            const dateStr = `${today.getDate().toString().padStart(2, '0')}_${(today.getMonth() + 1).toString().padStart(2, '0')}_${today.getFullYear()}`;
                            generateEstadisticasPDF(eventosStats, `estadistica_global_${dateStr}.pdf`);
                        }}
                        className="h-16 bg-neutral-900 hover:bg-black text-white font-black rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg"
                    >
                        <FileDown size={20} />
                        <span className="text-[10px] uppercase tracking-widest">PDF</span>
                    </Button>
                </div>
            </section>

            {/* Estadisticas Individual Section */}
            <section className="space-y-4 pt-4 border-t border-black/5">
                <div className="space-y-2">
                    <h2 className="text-sm font-black text-neutral-900 uppercase tracking-tight ml-1">Exportar Por Evento</h2>
                    <select
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl border border-black/10 bg-white text-sm font-bold text-neutral-700 focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                        <option value="">Seleccionar Evento...</option>
                        {eventosStats.map(e => (
                            <option key={e.id} value={e.id}>
                                {e.titulo} - {new Date(e.fecha_inicio).toLocaleDateString()}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button
                        disabled={!selectedEventId}
                        onClick={() => {
                            const event = eventosStats.find(e => e.id === selectedEventId);
                            if (event) {
                                const year = new Date(event.fecha_inicio).getFullYear();
                                const eventName = event.titulo.replace(/[:\\/?*\[\]]/g, '_'); // Sanitize
                                generateEstadisticasExcel([event], `estadistica_${eventName}_${year}.xlsx`);
                            }
                        }}
                        className="h-14 bg-white border border-black/5 hover:bg-neutral-50 text-neutral-900 font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                        <Table size={18} />
                        <span className="text-[10px] uppercase tracking-widest">Excel</span>
                    </Button>
                    <Button
                        disabled={!selectedEventId}
                        onClick={() => {
                            const event = eventosStats.find(e => e.id === selectedEventId);
                            if (event) {
                                const year = new Date(event.fecha_inicio).getFullYear();
                                const eventName = event.titulo.replace(/[:\\/?*\[\]]/g, '_'); // Sanitize
                                generateEstadisticasPDF([event], `estadistica_${eventName}_${year}.pdf`);
                            }
                        }}
                        className="h-14 bg-white border border-black/5 hover:bg-neutral-50 text-neutral-900 font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                        <FileDown size={18} />
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
