let recetas = [];
let idEditando = null;
const filtrosPorDefecto = {
  categoria: 'Todas',
  busqueda: '',
  orden: 'nombre-asc',
  precioMaximo: 0,
  soloMenu: false
};
let filtrosActuales = { ...filtrosPorDefecto };

function renderRecetas() {
  const contenedor = document.getElementById('recetas-container');
  const resultado = aplicarFiltros(recetas, filtrosActuales);

  document.getElementById('contador-resultados').textContent =
    `Mostrando ${resultado.length} de ${recetas.length} recetas`;

  if (resultado.length === 0) {
    contenedor.innerHTML = `
      <div class="sin-resultados">
        <p>😕 No se encontraron recetas con esos criterios.</p>
        <button type="button" class="btn-secundario" data-accion="limpiar-filtros">Quitar filtros</button>
      </div>`;
    return;
  }

  contenedor.innerHTML = resultado.map(crearTarjetaReceta).join('');
}

function crearTarjetaReceta(receta) {
  const nombre = escaparHTML(receta.nombre);
  return `
    <article class="receta-card ${receta.menuDelDia ? 'en-menu' : ''}" data-id="${receta.id}">
      <div class="receta-img">
        <img src="${escaparHTML(receta.imagen)}" alt="${nombre}" loading="lazy"
             onerror="this.onerror=null;this.src='${IMAGEN_POR_DEFECTO}'" />
        ${receta.menuDelDia ? '<span class="sello-menu">⭐ Menú del día</span>' : ''}
      </div>
      <div class="receta-card-body">
        <span class="badge badge-${quitarTildes(receta.categoria.toLowerCase())}">${escaparHTML(receta.categoria)}</span>
        <h3>${nombre}</h3>
        <p>${escaparHTML(receta.descripcion)}</p>
        <details class="ingredientes">
          <summary>Ver ingredientes (${receta.ingredientes.length})</summary>
          <ul>${receta.ingredientes.map(i => `<li>${escaparHTML(i)}</li>`).join('')}</ul>
        </details>
        <span class="precio">${formatearPrecio(receta.precio)}</span>
        <div class="acciones">
          <button type="button" class="btn-menu" data-accion="menu" data-id="${receta.id}">
            ${receta.menuDelDia ? 'Quitar del menú' : 'Añadir al menú'}
          </button>
          <button type="button" class="btn-editar" data-accion="editar" data-id="${receta.id}">Editar</button>
          <button type="button" class="btn-eliminar" data-accion="eliminar" data-id="${receta.id}">Eliminar</button>
        </div>
      </div>
    </article>`;
}

function renderResumen() {
  const visibles = aplicarFiltros(recetas, filtrosActuales);
  const menu = recetas.filter(r => r.menuDelDia);
  const conteo = contarPorCategoria(recetas);

  document.getElementById('precio-promedio').textContent = formatearPrecio(precioPromedio(visibles));
  document.getElementById('promedio-menu').textContent = formatearPrecio(precioPromedio(menu));
  document.getElementById('total-recetas').textContent = recetas.length;

  document.querySelectorAll('.categorias-lista li').forEach(li => {
    const cat = li.dataset.categoria;
    const cantidad = cat === 'Todas' ? recetas.length : conteo[cat] || 0;
    li.querySelector('.cantidad').textContent = cantidad;
  });
}

function renderMenuDelDia() {
  const contenedor = document.getElementById('menu-dia-lista');
  const menu = ordenarRecetas(recetas.filter(r => r.menuDelDia), 'precio-asc');

  document.getElementById('menu-dia-fecha').textContent = new Date().toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  if (menu.length === 0) {
    contenedor.innerHTML = '<li class="menu-vacio">Aún no hay platos en el menú de hoy. Usa “Añadir al menú” en una receta.</li>';
  } else {
    contenedor.innerHTML = menu.map(r => `
      <li>
        <span class="menu-nombre">${escaparHTML(r.nombre)} <small>· ${escaparHTML(r.categoria)}</small></span>
        <span class="menu-puntos"></span>
        <span class="menu-precio">${formatearPrecio(r.precio)}</span>
      </li>`).join('');
  }

  document.getElementById('menu-dia-total').textContent = formatearPrecio(precioTotal(menu));
  document.getElementById('menu-dia-cantidad').textContent = menu.length;
}

function renderSedes() {
  document.getElementById('sedes-lista').innerHTML = sedes.map(s => `
    <article class="sede-card">
      <h3>📍 ${s.ciudad}</h3>
      <p>${s.direccion}</p>
      <p>🕒 ${s.horario}</p>
      <p>📞 <a href="tel:${s.telefono.replace(/\s/g, '')}">${s.telefono}</a></p>
    </article>`).join('');
}

function renderCategoriasActivas() {
  document.querySelectorAll('.categorias-lista li').forEach(li => {
    const activa = li.dataset.categoria === filtrosActuales.categoria;
    li.classList.toggle('active', activa);
    li.setAttribute('aria-pressed', activa ? 'true' : 'false');
  });
}

function renderControles() {
  const max = precioMasAlto(recetas) || 50000;
  const rango = document.getElementById('precio-maximo');
  rango.max = Math.ceil(max / 1000) * 1000;
  if (!filtrosActuales.precioMaximo || filtrosActuales.precioMaximo > Number(rango.max)) {
    filtrosActuales.precioMaximo = Number(rango.max);
  }
  rango.value = filtrosActuales.precioMaximo;
  document.getElementById('precio-maximo-valor').textContent = formatearPrecio(filtrosActuales.precioMaximo);
  document.getElementById('buscar').value = filtrosActuales.busqueda;
  document.getElementById('filtro-categoria').value = filtrosActuales.categoria;
  document.getElementById('orden').value = filtrosActuales.orden;
  document.getElementById('solo-menu').checked = filtrosActuales.soloMenu;
}

function renderModoFormulario() {
  const editando = idEditando !== null;
  document.getElementById('titulo-formulario').textContent = editando ? 'Editar receta' : 'Agregar nueva receta';
  document.getElementById('btn-submit').textContent = editando ? 'Guardar cambios' : 'Agregar receta';
  document.getElementById('btn-cancelar').hidden = !editando;
}

function renderTodo() {
  renderControles();
  renderCategoriasActivas();
  renderRecetas();
  renderResumen();
  renderMenuDelDia();
}

function mostrarAviso(mensaje, tipo = 'exito') {
  const aviso = document.getElementById('aviso');
  aviso.textContent = mensaje;
  aviso.className = `aviso visible ${tipo}`;
  clearTimeout(mostrarAviso.temporizador);
  mostrarAviso.temporizador = setTimeout(() => aviso.classList.remove('visible'), 2800);
}

function actualizarFiltro(clave, valor) {
  filtrosActuales[clave] = valor;
  guardarFiltros(filtrosActuales);
  renderTodo();
}

function limpiarFiltros() {
  filtrosActuales = { ...filtrosPorDefecto };
  guardarFiltros(filtrosActuales);
  renderTodo();
}

function alternarMenuDelDia(id) {
  const receta = buscarPorId(recetas, id);
  if (!receta) return;
  receta.menuDelDia = !receta.menuDelDia;
  guardar(recetas);
  renderTodo();
  mostrarAviso(receta.menuDelDia ? `“${receta.nombre}” se añadió al menú del día` : `“${receta.nombre}” salió del menú del día`);
}

function empezarEdicion(id) {
  const receta = buscarPorId(recetas, id);
  if (!receta) return;
  idEditando = id;
  limpiarFormulario();
  llenarFormulario(receta);
  renderModoFormulario();
  document.getElementById('formulario').scrollIntoView({ behavior: 'smooth' });
  document.getElementById('nombre').focus({ preventScroll: true });
}

function cancelarEdicion() {
  idEditando = null;
  limpiarFormulario();
  renderModoFormulario();
}

function eliminarReceta(id) {
  const receta = buscarPorId(recetas, id);
  if (!receta || !confirm(`¿Eliminar “${receta.nombre}”?`)) return;
  recetas = recetas.filter(r => r.id !== id);
  if (idEditando === id) cancelarEdicion();
  guardar(recetas);
  renderTodo();
  mostrarAviso('Receta eliminada', 'info');
}

function manejarEnvioFormulario(e) {
  e.preventDefault();
  if (!validarFormulario()) {
    mostrarAviso('Revisa los campos marcados en rojo', 'error');
    return;
  }

  const datos = obtenerDatosFormulario();

  if (idEditando !== null) {
    recetas = recetas.map(r => (r.id === idEditando ? { ...r, ...datos } : r));
    mostrarAviso(`✅ Cambios guardados en “${datos.nombre}”`);
    idEditando = null;
  } else {
    recetas.push({ ...datos, id: generarId(recetas), fecha: new Date().toISOString().slice(0, 10) });
    mostrarAviso(`✅ Receta agregada: ${datos.nombre}`);
  }

  guardar(recetas);
  limpiarFormulario();
  renderModoFormulario();
  renderTodo();
}

function restaurarDatos() {
  if (!confirm('¿Seguro que deseas borrar tus cambios y volver a las recetas iniciales?')) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_FILTROS);
  recetas = cargar();
  filtrosActuales = { ...filtrosPorDefecto };
  cancelarEdicion();
  renderTodo();
  mostrarAviso('Se restauraron las recetas iniciales', 'info');
}

function inicializarEventos() {
  document.getElementById('buscar').addEventListener('input', e => actualizarFiltro('busqueda', e.target.value));
  document.getElementById('filtro-categoria').addEventListener('change', e => actualizarFiltro('categoria', e.target.value));
  document.getElementById('orden').addEventListener('change', e => actualizarFiltro('orden', e.target.value));
  document.getElementById('precio-maximo').addEventListener('input', e => actualizarFiltro('precioMaximo', Number(e.target.value)));
  document.getElementById('solo-menu').addEventListener('change', e => actualizarFiltro('soloMenu', e.target.checked));
  document.getElementById('btn-limpiar-filtros').addEventListener('click', limpiarFiltros);

  document.querySelectorAll('.categorias-lista li').forEach(li => {
    li.addEventListener('click', () => actualizarFiltro('categoria', li.dataset.categoria));
    li.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        actualizarFiltro('categoria', li.dataset.categoria);
      }
    });
  });

  document.getElementById('recetas-container').addEventListener('click', e => {
    const boton = e.target.closest('[data-accion]');
    if (!boton) return;
    const id = Number(boton.dataset.id);
    const acciones = {
      menu: () => alternarMenuDelDia(id),
      editar: () => empezarEdicion(id),
      eliminar: () => eliminarReceta(id),
      'limpiar-filtros': limpiarFiltros
    };
    acciones[boton.dataset.accion]?.();
  });

  const form = document.getElementById('form-receta');
  form.addEventListener('submit', manejarEnvioFormulario);
  Object.keys(reglasValidacion).forEach(campo => {
    const input = document.getElementById(campo);
    input.addEventListener('blur', () => validarCampo(campo));
    input.addEventListener('input', () => {
      if (input.classList.contains('invalid')) validarCampo(campo);
    });
  });
  document.getElementById('btn-cancelar').addEventListener('click', cancelarEdicion);
  document.getElementById('btn-reset').addEventListener('click', restaurarDatos);

  const botonMenu = document.getElementById('btn-menu-movil');
  const enlaces = document.querySelector('.nav-links');
  botonMenu.addEventListener('click', () => {
    const abierto = enlaces.classList.toggle('abierto');
    botonMenu.setAttribute('aria-expanded', abierto ? 'true' : 'false');
  });
  enlaces.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    enlaces.classList.remove('abierto');
    botonMenu.setAttribute('aria-expanded', 'false');
  }));
}

function init() {
  recetas = cargar();
  filtrosActuales = { ...filtrosPorDefecto, ...(cargarFiltros() || {}) };
  document.getElementById('anio').textContent = new Date().getFullYear();
  renderSedes();
  renderModoFormulario();
  renderTodo();
  inicializarEventos();
}

document.addEventListener('DOMContentLoaded', init);
