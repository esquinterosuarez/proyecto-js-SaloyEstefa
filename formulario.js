const reglasValidacion = {
  nombre(valor) {
    if (!valor) return 'El nombre es obligatorio.';
    if (valor.length < 3) return 'El nombre debe tener al menos 3 letras.';
    if (valor.length > 50) return 'El nombre no puede pasar de 50 caracteres.';
    const repetido = recetas.find(r =>
      r.nombre.toLowerCase() === valor.toLowerCase() && r.id !== idEditando
    );
    if (repetido) return 'Ya existe una receta con ese nombre.';
    return '';
  },
  categoria(valor) {
    return valor ? '' : 'Selecciona una categoría.';
  },
  precio(valor) {
    const numero = Number(valor);
    if (!valor) return 'El precio es obligatorio.';
    if (isNaN(numero) || numero <= 0) return 'Ingresa un precio válido mayor a 0.';
    if (numero < 1000) return 'El precio mínimo es $1.000.';
    if (numero > 500000) return 'El precio máximo es $500.000.';
    return '';
  },
  imagen(valor) {
    if (!valor) return '';
    try {
      const url = new URL(valor);
      return url.protocol.startsWith('http') ? '' : 'La URL debe empezar por http o https.';
    } catch {
      return 'URL de imagen no válida.';
    }
  },
  ingredientes(valor) {
    const lista = convertirIngredientes(valor);
    if (lista.length === 0) return 'Escribe al menos un ingrediente.';
    return '';
  },
  descripcion(valor) {
    if (!valor) return 'La descripción es obligatoria.';
    if (valor.length < 10) return 'La descripción debe tener al menos 10 caracteres.';
    return '';
  }
};

function convertirIngredientes(texto) {
  return texto
    .split(',')
    .map(i => i.trim())
    .filter(i => i.length > 0)
    .map(i => i.charAt(0).toUpperCase() + i.slice(1));
}

function validarCampo(nombreCampo) {
  const input = document.getElementById(nombreCampo);
  const errorSpan = document.getElementById('error-' + nombreCampo);
  const mensaje = reglasValidacion[nombreCampo](input.value.trim());
  input.classList.toggle('invalid', Boolean(mensaje));
  input.classList.toggle('valid', !mensaje && input.value.trim() !== '');
  input.setAttribute('aria-invalid', mensaje ? 'true' : 'false');
  errorSpan.textContent = mensaje;
  return !mensaje;
}

function validarFormulario() {
  const resultados = Object.keys(reglasValidacion).map(validarCampo);
  const valido = resultados.every(Boolean);
  if (!valido) {
    const primero = document.querySelector('#form-receta .invalid');
    if (primero) primero.focus();
  }
  return valido;
}

function obtenerDatosFormulario() {
  return {
    nombre: document.getElementById('nombre').value.trim(),
    categoria: document.getElementById('categoria').value,
    precio: Number(document.getElementById('precio').value),
    imagen: document.getElementById('imagen').value.trim() || IMAGEN_POR_DEFECTO,
    ingredientes: convertirIngredientes(document.getElementById('ingredientes').value),
    descripcion: document.getElementById('descripcion').value.trim(),
    menuDelDia: document.getElementById('menu-dia').checked
  };
}

function llenarFormulario(receta) {
  document.getElementById('nombre').value = receta.nombre;
  document.getElementById('categoria').value = receta.categoria;
  document.getElementById('precio').value = receta.precio;
  document.getElementById('imagen').value = receta.imagen.startsWith('http') ? receta.imagen : '';
  document.getElementById('ingredientes').value = receta.ingredientes.join(', ');
  document.getElementById('descripcion').value = receta.descripcion;
  document.getElementById('menu-dia').checked = receta.menuDelDia;
}

function limpiarFormulario() {
  document.getElementById('form-receta').reset();
  document.querySelectorAll('#form-receta .error').forEach(el => (el.textContent = ''));
  document.querySelectorAll('#form-receta .invalid, #form-receta .valid').forEach(el => {
    el.classList.remove('invalid', 'valid');
  });
}
