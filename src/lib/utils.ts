import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getSiteUrl() {
    let url = process.env.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
        process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
        "http://localhost:3000";

    // Make sure to include `https://` when not localhost.
    url = url.includes("http") ? url : `https://${url}`;

    // Make sure to include the trailing slash.
    url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
    return url;
}

/**
 * Retorna el nombre de visualización de un costalero.
 * Prioriza el apodo si está disponible, sino retorna nombre completo.
 * 
 * @param costalero - Objeto con datos del costalero
 * @returns Nombre para mostrar (apodo o nombre+apellidos)
 */
export function getDisplayName(costalero: { apodo?: string | null; nombre: string; apellidos: string }): string {
    if (costalero.apodo && costalero.apodo.trim() !== '') {
        return costalero.apodo.trim();
    }
    return `${costalero.nombre} ${costalero.apellidos}`;
}
