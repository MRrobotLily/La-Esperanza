// ──────────────────────────────────────────────────────────────────────────────
// Generador de "PDF" — abrimos una ventana con el listado formateado e invocamos
// la impresión nativa del navegador. El usuario puede imprimir o "Guardar como
// PDF" desde el diálogo (todos los navegadores modernos lo ofrecen).
//
// Esta estrategia evita añadir dependencias (jsPDF, pdfmake…) y mantiene el
// paquete ligero. Si más adelante se necesita PDF real sin diálogo, se puede
// migrar a una librería sin tocar los consumidores.
// ──────────────────────────────────────────────────────────────────────────────

import { fmtFechaHora, fmtQuetzales } from './format';

export interface ItemListaPdf {
  nombre: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  subtotal: number;
}

export interface DatosListaPdf {
  compradorNombre: string;
  compradorTelefono: string;
  productorNombre: string;
  productorTelefono?: string;
  items: ItemListaPdf[];
  total: number;
  notas?: string;
}

/**
 * Construye el HTML imprimible y lo abre en ventana nueva.
 * Si el popup es bloqueado, como fallback abrimos en la misma pestaña.
 */
export function imprimirListaCompras(datos: DatosListaPdf): void {
  const filas = datos.items
    .map(
      (i) => `
        <tr>
          <td>${escapar(i.nombre)}</td>
          <td class="num">${i.cantidad} ${escapar(i.unidad)}</td>
          <td class="num">${fmtQuetzales(i.precioUnitario)}</td>
          <td class="num">${fmtQuetzales(i.subtotal)}</td>
        </tr>`,
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Lista de compras — La Esperanza</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      color: #1f2937;
      margin: 24px;
      background: #fff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 3px solid #2D6A4F;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .logo { color: #2D6A4F; font-size: 28px; font-weight: 700; letter-spacing: 0.5px; }
    .subtitulo { color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; }
    .meta { text-align: right; font-size: 12px; color: #6b7280; }
    .panel {
      background: #f9f6f0;
      border: 1px solid #e5dfd4;
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 18px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    .campo-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #6b7280;
      margin-bottom: 3px;
    }
    .campo-valor {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
    }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead {
      background: #2D6A4F;
      color: #fff;
    }
    th, td {
      padding: 10px 12px;
      text-align: left;
    }
    th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
    tbody tr:nth-child(even) { background: #fafaf7; }
    tbody tr { border-bottom: 1px solid #e5e7eb; }
    .num { text-align: right; white-space: nowrap; }
    .total {
      margin-top: 16px;
      padding: 14px 18px;
      background: #2D6A4F;
      color: #fff;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
    }
    .total .amount { font-size: 22px; font-weight: 700; }
    .notas {
      margin-top: 18px;
      padding: 12px 14px;
      border-left: 4px solid #D4A24E;
      background: #fff8ea;
      font-size: 13px;
      color: #5a4300;
    }
    .footer {
      margin-top: 28px;
      font-size: 11px;
      color: #6b7280;
      border-top: 1px dashed #d1d5db;
      padding-top: 12px;
      text-align: center;
      line-height: 1.6;
    }
    @media print {
      body { margin: 0; padding: 18mm; }
      .no-print { display: none; }
    }
    .btn-imprimir {
      position: fixed;
      top: 16px;
      right: 16px;
      background: #2D6A4F;
      color: #fff;
      border: 0;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    }
  </style>
</head>
<body>
  <button class="btn-imprimir no-print" onclick="window.print()">🖨️ Imprimir o guardar PDF</button>

  <div class="header">
    <div>
      <div class="logo">🌿 La Esperanza</div>
      <div class="subtitulo">DERCAS · Lista de compras</div>
    </div>
    <div class="meta">
      Generado: ${fmtFechaHora(new Date().toISOString())}
    </div>
  </div>

  <div class="grid">
    <div class="panel">
      <div class="campo-label">Comprador</div>
      <div class="campo-valor">${escapar(datos.compradorNombre)}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:4px">${escapar(
        datos.compradorTelefono,
      )}</div>
    </div>
    <div class="panel">
      <div class="campo-label">Productor destinatario</div>
      <div class="campo-valor">${escapar(datos.productorNombre)}</div>
      ${
        datos.productorTelefono
          ? `<div style="font-size:12px;color:#6b7280;margin-top:4px">${escapar(
              datos.productorTelefono,
            )}</div>`
          : ''
      }
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Producto</th>
        <th class="num">Cantidad</th>
        <th class="num">Precio unit.</th>
        <th class="num">Subtotal</th>
      </tr>
    </thead>
    <tbody>${filas}</tbody>
  </table>

  <div class="total">
    <span>Total estimado</span>
    <span class="amount">${fmtQuetzales(datos.total)}</span>
  </div>

  ${
    datos.notas
      ? `<div class="notas">📝 ${escapar(datos.notas)}</div>`
      : ''
  }

  <div class="footer">
    Este listado es una solicitud de compra, no un cobro formal.<br />
    El precio final se confirmará directamente con el productor al aceptar el acuerdo.<br />
    La Esperanza · DERCAS · Prototipo funcional
  </div>

  <script>
    // Dispara el diálogo de impresión automáticamente tras un breve delay
    // para que la ventana termine de renderizar.
    window.addEventListener('load', function () {
      setTimeout(function () { window.print(); }, 400);
    });
  </script>
</body>
</html>`;

  const ventana = window.open('', '_blank', 'noopener,noreferrer,width=900,height=1100');
  if (!ventana) {
    // Popup bloqueado: fallback a data URL (abre en la misma pestaña)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    return;
  }
  ventana.document.open();
  ventana.document.write(html);
  ventana.document.close();
}

function escapar(txt: string): string {
  return (txt ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Construye el texto plano de WhatsApp/mensaje para el listado de compras.
 */
export function construirTextoLista(datos: DatosListaPdf): string {
  const fecha = fmtFechaHora(new Date().toISOString());
  const encabezado = `🌿 *Lista de compras — La Esperanza*\n${fecha}\n\nHola ${datos.productorNombre}, le envío mi solicitud de compra:\n`;
  const lineas = datos.items
    .map(
      (i) =>
        `• ${i.nombre} — ${i.cantidad} ${i.unidad} (${fmtQuetzales(i.precioUnitario)}/u) = ${fmtQuetzales(
          i.subtotal,
        )}`,
    )
    .join('\n');
  const pie =
    `\n\n*Total estimado:* ${fmtQuetzales(datos.total)}\n` +
    `Comprador: ${datos.compradorNombre} (${datos.compradorTelefono})\n` +
    (datos.notas ? `\nNotas: ${datos.notas}\n` : '') +
    `\nEl precio final se confirma al aceptar el acuerdo. ¡Gracias!`;
  return encabezado + lineas + pie;
}
