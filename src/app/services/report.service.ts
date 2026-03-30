import { Injectable } from '@angular/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import html2canvas from 'html2canvas';

export interface ReportColumna {
  cabecera: string;
  campo: string;
  alinear?: 'izquierda' | 'centro' | 'derecha';
  formato?: (valor: any, fila?: any) => string;
}

export interface ReportConfig {
  titulo: string;
  subtitulo?: string;
  columnas: ReportColumna[];
  datos: any[];
  colorAcento?: string;
  icono?: string;
}

@Injectable({ providedIn: 'root' })
export class ReportService {

  async generarImagen(config: ReportConfig): Promise<void> {
    const contenedor = this.construirTablaHtml(config);
    document.body.appendChild(contenedor);

    try {
      const canvas = await html2canvas(contenedor.firstElementChild as HTMLElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f0f2f5',
        logging: false,
      });

      const base64 = canvas.toDataURL('image/png').split(',')[1];
      const nombreArchivo = `reporte_${Date.now()}.png`;

      if (Capacitor.isNativePlatform()) {
        // Móvil: guardar y abrir share sheet nativo
        await Filesystem.writeFile({
          path: nombreArchivo,
          data: base64,
          directory: Directory.Cache,
        });
        const { uri } = await Filesystem.getUri({
          path: nombreArchivo,
          directory: Directory.Cache,
        });
        await Share.share({
          title: config.titulo,
          text: config.subtitulo ?? '',
          files: [uri],
          dialogTitle: 'Guardar imagen del reporte',
        });
      } else {
        // Browser: descarga directa
        const link = document.createElement('a');
        link.href = 'data:image/png;base64,' + base64;
        link.download = nombreArchivo;
        link.click();
      }

    } finally {
      document.body.removeChild(contenedor);
    }
  }

  // ─── Constructor del HTML de la tabla ──────────────────────────────────────
  private construirTablaHtml(config: ReportConfig): HTMLElement {
    const color  = config.colorAcento ?? '#1a7a4a';
    const icono  = config.icono ?? '📋';
    const ahora  = new Date().toLocaleDateString('es-PE', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    // Ancho dinámico: mínimo 600px, ~140px por columna
    const anchoPorColumna = 140;
    const anchoTotal = Math.max(600, config.columnas.length * anchoPorColumna);

    const alinearCss = (a?: string) =>
      a === 'derecha' ? 'right' : a === 'centro' ? 'center' : 'left';

    // Encabezados
    const thHtml = config.columnas.map(col => `
      <th style="
        padding: 11px 14px;
        background: ${color};
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        text-align: ${alinearCss(col.alinear)};
        white-space: nowrap;
      ">${col.cabecera}</th>
    `).join('');

    // Filas
    const trHtml = config.datos.length === 0
      ? `<tr><td colspan="${config.columnas.length}" style="
            padding: 32px; text-align: center;
            color: #aaa; font-size: 14px;
          ">Sin datos registrados</td></tr>`
      : config.datos.map((fila, i) => {
          const bg = i % 2 === 0 ? '#ffffff' : '#f8f9fb';
          const celdas = config.columnas.map(col => {
            const valor = col.formato
              ? col.formato(fila[col.campo], fila)
              : (fila[col.campo] ?? '—');
            return `<td style="
              padding: 10px 14px;
              background: ${bg};
              border-bottom: 1px solid #eaecef;
              font-size: 13px;
              color: #2d3748;
              text-align: ${alinearCss(col.alinear)};
            ">${valor}</td>`;
          }).join('');
          return `<tr>${celdas}</tr>`;
        }).join('');

    const html = `
      <div style="
        background: #f0f2f5;
        padding: 20px;
        font-family: Arial, Helvetica, sans-serif;
        width: ${anchoTotal}px;
      ">
        <!-- Cabecera -->
        <div style="
          background: linear-gradient(135deg, ${color} 0%, ${color}cc 100%);
          padding: 20px 24px;
          border-radius: 14px 14px 0 0;
          display: flex;
          align-items: center;
          gap: 14px;
        ">
          <div style="
            background: rgba(255,255,255,0.2);
            border-radius: 10px;
            width: 46px; height: 46px;
            display: flex; align-items: center; justify-content: center;
            font-size: 24px;
            flex-shrink: 0;
          ">${icono}</div>
          <div>
            <div style="
              color: #fff; font-size: 20px; font-weight: 700;
              letter-spacing: 0.02em; margin-bottom: 4px;
            ">${config.titulo}</div>
            ${config.subtitulo ? `<div style="color: rgba(255,255,255,0.8); font-size: 13px;">${config.subtitulo}</div>` : ''}
          </div>
          <div style="margin-left: auto; text-align: right;">
            <div style="color: rgba(255,255,255,0.7); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em;">Total registros</div>
            <div style="color: #fff; font-size: 22px; font-weight: 800;">${config.datos.length}</div>
          </div>
        </div>

        <!-- Tabla -->
        <div style="
          background: #fff;
          border-radius: 0 0 14px 14px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        ">
          <table style="width: 100%; border-collapse: collapse;">
            <thead><tr>${thHtml}</tr></thead>
            <tbody>${trHtml}</tbody>
          </table>
        </div>

        <!-- Pie -->
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          padding: 0 2px;
        ">
          <span style="font-size: 11px; color: #999; font-weight: 700; letter-spacing: 0.05em;">AGROGEST</span>
          <span style="font-size: 11px; color: #aaa;">Generado: ${ahora}</span>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    wrapper.style.cssText = 'position:fixed; top:-9999px; left:-9999px; z-index:-1; pointer-events:none;';
    return wrapper;
  }
}
