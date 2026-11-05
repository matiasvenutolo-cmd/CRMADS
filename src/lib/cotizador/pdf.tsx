import 'server-only'
import path from 'node:path'
import { Document, Image, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer'
import type { DocumentoCotizacion } from './documento'

const AZUL = '#023D80'
const NARANJA = '#FAA61A'
const GRIS = '#5C6875'
const TINTA = '#23272B'
const LINEA = '#D8E0E7'

const s = StyleSheet.create({
  pagina: { paddingTop: 86, paddingBottom: 60, paddingHorizontal: 54, fontFamily: 'Helvetica', fontSize: 9.4, color: TINTA, lineHeight: 1.45 },
  header: { position: 'absolute', top: 28, left: 54, right: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottomWidth: 1.5, borderBottomColor: NARANJA },
  logo: { width: 58, height: 32 },
  marca: { fontFamily: 'Helvetica-Bold', fontSize: 9, color: AZUL, letterSpacing: 1.2 },
  footer: { position: 'absolute', top: 808, left: 54, right: 54, flexDirection: 'row', justifyContent: 'space-between', fontSize: 7.5, color: GRIS },
  arriba: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  fecha: { color: GRIS },
  numeroCaja: { alignItems: 'flex-end' },
  numeroLabel: { fontSize: 7.5, color: GRIS, letterSpacing: 1, textTransform: 'uppercase' },
  numero: { fontFamily: 'Helvetica-Bold', fontSize: 15, color: AZUL, marginTop: 2 },
  senores: { color: GRIS },
  cliente: { fontFamily: 'Helvetica-Bold', fontSize: 11.5, marginTop: 1 },
  referencia: { marginTop: 14, marginBottom: 12, paddingLeft: 9, borderLeftWidth: 2.5, borderLeftColor: NARANJA },
  titulo: { fontFamily: 'Helvetica-Bold', fontSize: 9.6, color: AZUL, letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 12, marginBottom: 4 },
  parrafo: { marginBottom: 5, textAlign: 'justify' },
  negrita: { fontFamily: 'Helvetica-Bold' },
  fila: { flexDirection: 'row', borderBottomWidth: 0.6, borderBottomColor: LINEA, paddingVertical: 3.2 },
  filaK: { width: '40%', fontFamily: 'Helvetica-Bold', fontSize: 8, color: GRIS, textTransform: 'uppercase', paddingRight: 8 },
  filaV: { width: '60%' },
  precio: { backgroundColor: '#E6EEF8', borderLeftWidth: 3, borderLeftColor: AZUL, padding: 9, marginBottom: 6 },
  precioMonto: { fontFamily: 'Helvetica-Bold', fontSize: 14, color: AZUL, marginBottom: 3 },
  dato: { flexDirection: 'row', marginTop: 5 },
  datoK: { fontFamily: 'Helvetica-Bold', color: AZUL, width: 130, fontSize: 8.6, textTransform: 'uppercase' },
  datoV: { flex: 1 },
})

function Documento({ doc }: { doc: DocumentoCotizacion }) {
  const logo = path.join(process.cwd(), 'public/logo/ads-logo.png')
  return (
    <Document title={`Presupuesto ${doc.numero}`} author="Ascensores del Sur">
      <Page size="A4" style={s.pagina}>
        <View style={s.header} fixed>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={logo} style={s.logo} />
          <Text style={s.marca}>ASCENSORES DEL SUR</Text>
        </View>
        <View style={s.footer} fixed>
          <Text>Presupuesto {doc.numero}</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>

        <View style={s.arriba}>
          <View>
            <Text style={s.fecha}>{doc.lugarFecha}</Text>
            <Text style={[s.senores, { marginTop: 14 }]}>Señores:</Text>
            <Text style={s.cliente}>{doc.cliente}</Text>
            {doc.atencion ? <Text>Atte. {doc.atencion}</Text> : null}
          </View>
          <View style={s.numeroCaja}>
            <Text style={s.numeroLabel}>Presupuesto Nº</Text>
            <Text style={s.numero}>{doc.numero}</Text>
          </View>
        </View>
        <View style={s.referencia}>
          <Text>
            <Text style={s.negrita}>Referencia: </Text>
            {doc.referencia}
          </Text>
        </View>

        {doc.bloques.map((b, i) => {
          if (b.t === 'titulo') return <Text key={i} style={s.titulo} minPresenceAhead={40}>{b.texto}</Text>
          if (b.t === 'parrafo') return <Text key={i} style={[s.parrafo, b.negrita ? s.negrita : {}]}>{b.texto}</Text>
          if (b.t === 'salto') return <View key={i} break />
          if (b.t === 'precio')
            return (
              <View key={i} style={s.precio} wrap={false}>
                <Text style={s.precioMonto}>{b.monto}</Text>
                <Text>{b.texto}</Text>
              </View>
            )
          if (b.t === 'dato')
            return (
              <View key={i} style={s.dato} wrap={false}>
                <Text style={s.datoK}>{b.etiqueta}</Text>
                <Text style={s.datoV}>{b.valor}</Text>
              </View>
            )
          return (
            <View key={i} style={{ marginBottom: 4 }}>
              {b.filas.map(([k, v], j) => (
                <View key={j} style={s.fila} wrap={false}>
                  <Text style={s.filaK}>{k}</Text>
                  <Text style={s.filaV}>{v}</Text>
                </View>
              ))}
            </View>
          )
        })}
      </Page>
    </Document>
  )
}

export function documentoPdf(doc: DocumentoCotizacion) {
  return renderToBuffer(<Documento doc={doc} />)
}
