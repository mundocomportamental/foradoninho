// Estilo raster do OpenStreetMap Standard pro MapLibre GL JS — gratuito, sem
// API key (a CartoDB passou a exigir chave em 28/08/2026). O filtro cinza
// fica em globals.css, aplicado direto em ".maplibregl-canvas".
//
// Nitidez em tela retina: diferente da CartoDB antiga, o servidor do OSM não
// oferece tiles @2x — só imagens de 256px fixas. O MapLibre por padrão já
// busca um nível de zoom mais fundo que o "esperado" pra tiles de 256px (sua
// unidade de referência interna é 512px), mas isso não é suficiente pra
// telas de densidade 2x/3x (praticamente todo celular). Declarar um
// "tileSize" menor do que o tile real (256px) força o MapLibre a buscar mais
// um nível de zoom de detalhe nativo, ficando bem mais nítido no celular —
// só ativado quando a tela é realmente de alta densidade, pra não gastar
// bateria/dados à toa em telas comuns.
export function getOsmStyle() {
  const isRetina = typeof window !== 'undefined' && window.devicePixelRatio > 1
  return {
    version: 8 as const,
    sources: {
      osm: {
        type: 'raster' as const,
        tiles: [
          'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
          'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
        ],
        tileSize: isRetina ? 128 : 256,
        attribution: '© OpenStreetMap contributors',
      },
    },
    layers: [{ id: 'osm', type: 'raster' as const, source: 'osm' }],
  }
}
