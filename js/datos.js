const STORAGE_KEY = 'recetas_colombianas';
const STORAGE_FILTROS = 'recetas_colombianas_filtros';
const IMAGEN_POR_DEFECTO = 'imagenes/empanadas.jpeg';

const recetasIniciales = [
  {
    id: 1,
    nombre: 'Sancocho Costeño',
    categoria: 'Costeña',
    precio: 18000,
    imagen: 'imagenes/sopa.jpeg',
    descripcion: 'Sopa tradicional con pollo, maíz, yuca y plátano, servida con arroz y aguacate.',

    ingredientes: ['Pollo', 'Mazorca', 'Yuca', 'Plátano verde', 'Cilantro', 'Arroz', 'Aguacate'],
    menuDelDia: true,
    fecha: '2026-11-01'
  },
  {
    id: 2,
    nombre: 'Tamal Chocoano',
    categoria: 'Chocoana',
    precio: 15000,
    imagen: 'imagenes/tamal.jpg',
    descripcion: 'Tamal envuelto en hoja de plátano con arroz, carne de cerdo y especias del Pacífico.',

    ingredientes: ['Arroz', 'Carne de cerdo', 'Pollo', 'Hoja de plátano', 'Achiote', 'Especias'],
    menuDelDia: false,
    fecha: '2026-11-03'
  },
  {
    id: 3,
    nombre: 'Bandeja Paisa',
    categoria: 'Antioqueña',
    precio: 22000,
    imagen: 'imagenes/bandeja_paisa.jpg',
    descripcion: 'Frijoles, arroz, carne molida, chicharrón, huevo, plátano, arepa y aguacate.',

    ingredientes: ['Frijoles', 'Arroz', 'Carne molida', 'Chicharrón', 'Huevo', 'Plátano maduro', 'Arepa', 'Aguacate'],
    menuDelDia: true,
    fecha: '2026-11-05'
  },
  {
    id: 4,
    nombre: 'Empanadas de Maíz',
    categoria: 'Costeña',
    precio: 8000,
    imagen: 'imagenes/empanadas.jpeg',
    descripcion: 'Empanadas crocantes rellenas de carne o pollo, acompañadas de ají casero.',

    ingredientes: ['Masa de maíz', 'Carne', 'Papa', 'Hogao', 'Ají casero'],
    menuDelDia: false,
    fecha: '2026-11-08'
  },
  {
    id: 5,
    nombre: 'Frijoles Antioqueños',
    categoria: 'Antioqueña',
    precio: 16000,
    imagen: 'imagenes/frijoles.jpg',
    descripcion: 'Frijoles cargamanto con garra de cerdo, hogao, arroz blanco y tajadas de maduro.',

    ingredientes: ['Frijol cargamanto', 'Garra de cerdo', 'Hogao', 'Zanahoria', 'Arroz', 'Plátano maduro'],
    menuDelDia: false,
    fecha: '2026-11-10'
  },
  {
    id: 6,
    nombre: 'Viuda de Pescado',
    categoria: 'Chocoana',
    precio: 25000,
    imagen: 'imagenes/viuda.jpg',
    descripcion: 'Sopa de pescado del Pacífico con plátano, yuca y leche de coco.',

    ingredientes: ['Pescado', 'Plátano', 'Yuca', 'Leche de coco', 'Cebolla', 'Ajo'],
    menuDelDia: true,
    fecha: '2026-11-12'
  }
];

const sedes = [
  { ciudad: 'Medellín', direccion: 'Cra. 70 #44-21, Laureles', horario: 'Lun a Dom · 11:00 a.m. – 9:00 p.m.', telefono: '+57 604 444 1234' },
  { ciudad: 'Quibdó', direccion: 'Calle 26 #4-15, Centro', horario: 'Lun a Sáb · 11:30 a.m. – 8:00 p.m.', telefono: '+57 604 671 5678' },
  { ciudad: 'Cartagena', direccion: 'Av. San Martín #8-40, Bocagrande', horario: 'Todos los días · 12:00 m. – 10:00 p.m.', telefono: '+57 605 655 9012' }
];

function copiarRecetasIniciales() {
  return recetasIniciales.map(r => ({ ...r, ingredientes: [...r.ingredientes] }));
}

function normalizarReceta(r) {
  return {
    id: Number(r.id),
    nombre: String(r.nombre || ''),
    categoria: String(r.categoria || ''),
    precio: Number(r.precio) || 0,
    imagen: (r.imagen || IMAGEN_POR_DEFECTO).replace(/^img\//, 'imagenes/'),
    descripcion: String(r.descripcion || ''),
    ingredientes: Array.isArray(r.ingredientes) ? r.ingredientes : [],
    menuDelDia: Boolean(r.menuDelDia),
    fecha: r.fecha || new Date().toISOString().slice(0, 10)
  };
}

function cargar() {
  const datos = localStorage.getItem(STORAGE_KEY);
  if (datos) {
    try {
      const lista = JSON.parse(datos);
      if (Array.isArray(lista)) return lista.map(normalizarReceta);
    } catch (e) {
      console.warn('Error al leer localStorage, usando datos iniciales.', e);
    }
  }
  const iniciales = copiarRecetasIniciales();
  guardar(iniciales);
  return iniciales;
}

function guardar(recetas) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recetas));
}

function guardarFiltros(filtros) {
  localStorage.setItem(STORAGE_FILTROS, JSON.stringify(filtros));
}

function cargarFiltros() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_FILTROS));
  } catch {
    return null;
  }
}

function generarId(recetas) {
  if (recetas.length === 0) return 1;
  return Math.max(...recetas.map(r => r.id)) + 1;
}
