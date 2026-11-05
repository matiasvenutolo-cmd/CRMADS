import 'server-only'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { AlignmentType, BorderStyle, Document, Footer, Header, ImageRun, Packer, PageBreak, PageNumber, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType } from 'docx'
import type { DocumentoCotizacion } from './documento'

const AZUL = '023D80'
const NARANJA = 'FAA61A'
const GRIS = '5C6875'
const TINTA = '23272B'
const FUENTE = 'Arial'

const t = (texto: string, o: { bold?: boolean; color?: string; size?: number } = {}) => new TextRun({ text: texto, font: FUENTE, size: o.size ?? 20, bold: o.bold, color: o.color ?? TINTA })

export async function documentoWord(doc: DocumentoCotizacion): Promise<Buffer> {
  const logo = await readFile(path.join(process.cwd(), 'public/logo/ads-logo.png'))
  const cuerpo: (Paragraph | Table)[] = []

  cuerpo.push(new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 120 }, children: [t(doc.lugarFecha, { color: GRIS })] }))
  cuerpo.push(new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 240 }, children: [t('Presupuesto Nº: ', { color: GRIS }), t(doc.numero, { bold: true, color: AZUL, size: 24 })] }))
  cuerpo.push(new Paragraph({ children: [t('Señores:', { color: GRIS })] }))
  cuerpo.push(new Paragraph({ children: [t(doc.cliente, { bold: true, size: 22 })] }))
  if (doc.atencion) cuerpo.push(new Paragraph({ children: [t(`Atte. ${doc.atencion}`)] }))
  cuerpo.push(
    new Paragraph({
      spacing: { before: 240, after: 240 },
      border: { left: { style: BorderStyle.SINGLE, size: 18, color: NARANJA, space: 8 } },
      children: [t('Referencia: ', { bold: true }), t(doc.referencia)],
    })
  )

  for (const b of doc.bloques) {
    if (b.t === 'titulo')
      cuerpo.push(new Paragraph({ spacing: { before: 280, after: 100 }, keepNext: true, children: [t(b.texto.toUpperCase(), { bold: true, color: AZUL, size: 21 })] }))
    else if (b.t === 'parrafo') cuerpo.push(new Paragraph({ spacing: { after: 120 }, alignment: AlignmentType.JUSTIFIED, children: [t(b.texto, { bold: b.negrita })] }))
    else if (b.t === 'precio')
      cuerpo.push(
        new Paragraph({
          spacing: { after: 140 },
          shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'E6EEF8' },
          border: { left: { style: BorderStyle.SINGLE, size: 18, color: AZUL, space: 8 } },
          children: [t(b.texto, { bold: true })],
        })
      )
    else if (b.t === 'dato') cuerpo.push(new Paragraph({ spacing: { before: 120, after: 60 }, children: [t(`${b.etiqueta.toUpperCase()}: `, { bold: true, color: AZUL }), t(b.valor)] }))
    else if (b.t === 'salto') cuerpo.push(new Paragraph({ children: [new PageBreak()] }))
    else if (b.t === 'ficha')
      cuerpo.push(
        new Table({
          width: { size: 9500, type: WidthType.DXA },
          columnWidths: [3600, 5900],
          borders: {
            top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'D8E0E7' },
          },
          rows: b.filas.map(
            ([k, v]) =>
              new TableRow({
                children: [
                  new TableCell({ width: { size: 3600, type: WidthType.DXA }, children: [new Paragraph({ spacing: { before: 60, after: 60 }, children: [t(k.toUpperCase(), { bold: true, color: GRIS, size: 18 })] })] }),
                  new TableCell({ width: { size: 5900, type: WidthType.DXA }, children: [new Paragraph({ spacing: { before: 60, after: 60 }, children: [t(v)] })] }),
                ],
              })
          ),
        })
      )
  }

  const documento = new Document({
    creator: 'ADS Obras',
    title: `Presupuesto ${doc.numero}`,
    styles: { default: { document: { run: { font: FUENTE, size: 20 } } } },
    sections: [
      {
        properties: { page: { margin: { top: 1300, bottom: 1100, left: 1200, right: 1200 } } },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: NARANJA, space: 6 } },
                children: [new ImageRun({ type: 'png', data: logo, transformation: { width: 86, height: 48 } }), t('    ASCENSORES DEL SUR', { bold: true, color: AZUL, size: 20 })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [t(`Presupuesto ${doc.numero} · Página `, { color: GRIS, size: 16 }), new TextRun({ children: [PageNumber.CURRENT], font: FUENTE, size: 16, color: GRIS }), t(' de ', { color: GRIS, size: 16 }), new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FUENTE, size: 16, color: GRIS })],
              }),
            ],
          }),
        },
        children: cuerpo,
      },
    ],
  })
  return Packer.toBuffer(documento)
}
