function filtrarPorCategoria(recetas, categoria) {
  if (categoria === 'Todas' || !categoria) return recetas;
  return recetas.filter(r => r.categoria === categoria);
}

function buscarReceta(recetas, texto) {
  if (!texto) return recetas;
  const t = quitarTildes(texto.toLowerCase().trim());
  return recetas.filter(r =>
    quitarTildes(r.nombre.toLowerCase()).includes(t) ||
    quitarTildes(r.descripcion.toLowerCase()).includes(t) ||
    r.ingredientes.some(i => quitarTildes(i.toLowerCase()).includes(t))
  );
}

function filtrarPorPrecio(recetas, precioMaximo) {
  if (!precioMaximo) return recetas;
  return recetas.filter(r => r.precio <= precioMaximo);
}

function filtrarMenuDelDia(recetas, soloMenu) {
  if (!soloMenu) return recetas;
  return recetas.filter(r => r.menuDelDia);
}

function ordenarRecetas(recetas, criterio) {
  const copia = [...recetas];
  switch (criterio) {
    case 'nombre-asc':
      return copia.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    case 'nombre-desc':
      return copia.sort((a, b) => b.nombre.localeCompare(a.nombre, 'es'));
    case 'precio-asc':
      return copia.sort((a, b) => a.precio - b.precio);
    case 'precio-desc':

      return copia.sort((a, b) => b.precio - a.precio);
    case 'fecha-desc':
      return copia.sort((a, b) => b.fecha.localeCompare(a.fecha));
    case 'fecha-asc':
      return copia.sort((a, b) => a.fecha.localeCompare(b.fecha));
    default:
      return copia;
  }
}

function aplicarFiltros(recetas, { categoria, busqueda, orden, precioMaximo, soloMenu }) {
  let resultado = filtrarPorCategoria(recetas, categoria);
  resultado = buscarReceta(resultado, busqueda);
  resultado = filtrarPorPrecio(resultado, precioMaximo);
  resultado = filtrarMenuDelDia(resultado, soloMenu);
  return ordenarRecetas(resultado, orden);
}

function precioTotal(recetas) {
  return recetas.reduce((acc, r) => acc + r.precio, 0);
}

function precioPromedio(recetas) {
  if (recetas.length === 0) return 0;
  return Math.round(precioTotal(recetas) / recetas.length);
}

function precioMasAlto(recetas) {
  return recetas.reduce((max, r) => Math.max(max, r.precio), 0);
}

function buscarPorId(recetas, id) {
  return recetas.find(r => r.id === id);
}

function contarPorCategoria(recetas) {
  return recetas.reduce((conteo, r) => {
    conteo[r.categoria] = (conteo[r.categoria] || 0) + 1;
    return conteo;
  }, {});
}

function formatearPrecio(valor) {
  return '$' + Number(valor).toLocaleString('es-CO');
}

function quitarTildes(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function escaparHTML(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
