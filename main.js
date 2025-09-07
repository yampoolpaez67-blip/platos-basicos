// Selecciona el contenedor principal donde se mostrarán los platos
const platos = document.querySelector("#platos");

// Campo de entrada para buscar platos por nombre o ingredientes
const buscador = document.querySelector("#buscador");

// Lista de favoritos guardados en el navegador (si no hay nada, se crea una lista vacía).
// localStorage se usa para guardar información que no se pierde al recargar la página.
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

// Objeto que contiene todos los filtros posibles.
// Por defecto todos están vacíos y "mostrar" comienza en "todos".
const filtros = {
  criterio: "",
  dificultad: "",
  tiempo_preparacion: "",
  categoria: "",
  mostrar: "todos"
};

// Diccionario para traducir el valor de dificultad a un texto visible en español.
const dificultadMap = {
  facil: "Fácil",
  media: "Media",
  dificil: "Difícil"
};

// Diccionario para traducir las categorías internas a un texto amigable en español.
const categoriaMap = {
  desayuno: "Desayuno",
  almuerzo: "Almuerzo",
  cena: "Cena",
  postre: "Postre"
};

// Diccionario para mostrar los tiempos de preparación en forma más clara.
const tiempoMap = {
  rapido: "Menos de 15 min",
  medio: "15 - 30 min",
  largo: "Más de 30 min"
};

// Función que devuelve el color según la dificultad del plato.
// Esto ayuda a que visualmente se distinga si un plato es fácil, medio o difícil.
function getColorDificultad(dificultad) {
  switch (dificultad) {
    case "facil":
      return "verde";
    case "media":
      return "amarillo";
    case "dificil":
      return "rojo";
    default:
      return "gris"; // Si no hay dificultad definida
  }
}

// Función para crear una tarjeta (HTML) con la información de un plato
function crearPlato(plato_basico) {
  const div = document.createElement("div");
  div.className = "plato";

  // Verifica si el plato ya está en favoritos
  const esFavorito = favoritos.includes(plato_basico.nombre);

  // Estructura interna de la tarjeta de un plato
  div.innerHTML = `
    <div class="imagen-container">
      <img src="${plato_basico.imagen}" alt="Plato" class="imagen_plato" />
    </div>
    <div class="contenedor-favorito">
      <!-- Botón para agregar o quitar de favoritos -->
      <button class="btn-favorito ${esFavorito ? "activo" : ""}" data-nombre="${plato_basico.nombre}" aria-label="Añadir a favoritos">
        <svg class="icono-corazon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
          C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5
          c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>
    </div>
    <h3 class="titulo_plato">${plato_basico.nombre}</h3>
    <section class="ingredientes">
      <h5>Ingredientes</h5>
      <br/>
      ${plato_basico.ingredientes.map((ingrediente) => `<span>- ${ingrediente}</span>`).join("")}
    </section>
    <section class="detalles-plato">
      <span class="dificultad ${getColorDificultad(plato_basico.dificultad)}">
        ${dificultadMap[plato_basico.dificultad] || "N/A"}
      </span>
      <span class="tiempo">⏱ ${tiempoMap[plato_basico.tiempo_preparacion] || "N/A"}</span>
      <span class="categoria">${categoriaMap[plato_basico.categoria] || "N/A"}</span>
    </section>
    <section class="contenedor-boton-ver-receta">
      <button class="ver-receta-btn">Ver receta completa</button>
    </section>
  `;

  // Evento: abrir el modal con la receta al hacer clic en "Ver receta completa"
  div.querySelector(".ver-receta-btn").addEventListener("click", () => abrirModal(plato_basico));

  // Evento: agregar o quitar de favoritos
  const btnFav = div.querySelector(".btn-favorito");
  btnFav.addEventListener("click", () => {
    const nombrePlato = plato_basico.nombre;

    // Si ya está en favoritos, se elimina
    if (favoritos.includes(nombrePlato)) {
      favoritos = favoritos.filter((p) => p !== nombrePlato);
      btnFav.classList.remove("activo");
    } else {
      // Si no está en favoritos, se agrega
      favoritos.push(nombrePlato);
      btnFav.classList.add("activo");
    }

    // Actualiza los favoritos en localStorage
    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  });

  return div;
}

// Función que obtiene los platos aplicando filtros y búsqueda
function obtenerPlatos() {
  // Limpia el contenedor antes de volver a mostrar resultados
  platos.innerHTML = "";

  // Se normaliza el criterio: en minúsculas, sin números y sin espacios extras
  const criterio = filtros.criterio.replace(/[0-9]/g, "").toLowerCase().trim();

  // Filtra los platos según las condiciones seleccionadas
  let lista = platos_basicos.filter((p) => {
    const enNombre = p.nombre.toLowerCase().includes(criterio);
    const enIngredientes = p.ingredientes.some((ing) => ing.toLowerCase().includes(criterio));
    const matchDificultad = filtros.dificultad ? p.dificultad === filtros.dificultad : true;
    const matchTiempo = filtros.tiempo_preparacion ? p.tiempo_preparacion === filtros.tiempo_preparacion : true;
    const matchCategoria = filtros.categoria ? p.categoria === filtros.categoria : true;

    // Se devuelve true solo si cumple todos los filtros aplicados
    return (enNombre || enIngredientes) && matchDificultad && matchTiempo && matchCategoria;
  });

  // Si el filtro "mostrar" está en "favoritos", solo muestra los platos guardados
  if (filtros.mostrar === "favoritos") {
    lista = lista.filter((p) => favoritos.includes(p.nombre));
  }

  // Recorre los platos filtrados y los agrega al contenedor con una pequeña animación progresiva
  lista.forEach((plato, i) => {
    const card = crearPlato(plato);
    card.style.animationDelay = `${i * 0.1}s`; // Animación escalonada
    platos.appendChild(card);
  });
}

// Evento: búsqueda en tiempo real al escribir en el campo
buscador.addEventListener("input", (event) => {
  filtros.criterio = event.target.value;
  obtenerPlatos();
});

// ----------------------------
// Manejo de menús desplegables
// ----------------------------
/**
 * Nota: Un menú desplegable ó dropdown es un componente que se utiliza en desarrollo web
 *       para mostrar opciones (en este caso los filtros) de forma
 *       que pueda gestionar bien el espacio y siguiendo buenas prácticas
 *       de experiencia de usuario (UX) y de interfaz de usuario (UI).
 */

// Abre o cierra los menús de filtros
document.querySelectorAll(".dropdown-btn").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    e.stopPropagation(); // Evita que el clic cierre inmediatamente el menú

    // Cierra otros menús abiertos
    document.querySelectorAll(".dropdown-content").forEach((menu) => {
      if (menu !== this.nextElementSibling) {
        menu.classList.remove("show");
      }
    });

    // Abre o cierra el menú actual
    this.nextElementSibling.classList.toggle("show");
  });
});

// Cierra los menús si se hace clic fuera de ellos
window.addEventListener("click", () => {
  document.querySelectorAll(".dropdown-content").forEach((menu) =>
    menu.classList.remove("show")
  );
});

// Captura de selección en filtros
document.querySelectorAll(".dropdown-content span").forEach((item) => {
  item.addEventListener("click", (e) => {
    const value = e.target.getAttribute("data-value"); // Valor del filtro
    const parentBtn = e.target.closest(".dropdown").querySelector(".dropdown-btn .category");
    const filterType = parentBtn.getAttribute("data-filter");

    // Actualiza el filtro correspondiente
    filtros[filterType] = value;
    parentBtn.textContent = e.target.textContent;

    // Recarga la lista de platos con el nuevo filtro
    obtenerPlatos();
  });
});

// ----------------------------
// Reiniciar filtros
// ----------------------------
document.getElementById("reset-filtros").addEventListener("click", () => {
  // Se borran todos los filtros
  filtros.criterio = "";
  filtros.dificultad = "";
  filtros.tiempo_preparacion = "";
  filtros.categoria = "";
  buscador.value = "";

  // Se restauran los textos originales de los menús
  document.querySelectorAll(".dropdown")[1].querySelector(".category").textContent = "Dificultad";
  document.querySelectorAll(".dropdown")[2].querySelector(".category").textContent = "Tiempo de preparación";
  document.querySelectorAll(".dropdown")[3].querySelector(".category").textContent = "Categoría";

  obtenerPlatos();
});

// ----------------------------
// Modal de receta
// ----------------------------
/**
 * * Nota: Un modal o también conocido como ventana emergente 
 *       es un componente que se usa en desarrollo de software
 *       para mostrar contenido sobrepuesto a la página principal y así
 *       tener una forma óptima de mostrar información sin necesidad
 *       de redireccionar a otra página.
 */
const modal = document.getElementById("modal-receta");
const modalTitulo = document.getElementById("modal-titulo");
const modalImagen = document.getElementById("modal-imagen");
const modalIngredientes = document.getElementById("modal-ingredientes");
const modalPreparacion = document.getElementById("modal-preparacion");
const togglePreparacionBtn = document.getElementById("toggle-preparacion");
const closeBtn = document.querySelector(".close");
let modalAbierto = false;

// Función para abrir el modal con los detalles del plato seleccionado
function abrirModal(plato) {
  modalTitulo.textContent = plato.nombre;
  modalImagen.src = plato.imagen;

  // Lista de ingredientes en el modal
  modalIngredientes.innerHTML = plato.ingredientes.map((ing) => `<span>- ${ing}</span><br>`).join("");

  // Preparación con botón "ver más"
  modalPreparacion.textContent = plato.preparacion;
  if (plato.preparacion.length > 250) {
    modalPreparacion.textContent = plato.preparacion.substring(0, 250) + "...";
    togglePreparacionBtn.style.display = "inline-block";
    togglePreparacionBtn.dataset.expanded = "false";

    togglePreparacionBtn.onclick = () => {
      if (togglePreparacionBtn.dataset.expanded === "false") {
        modalPreparacion.textContent = plato.preparacion;
        togglePreparacionBtn.textContent = "Ver menos";
        togglePreparacionBtn.dataset.expanded = "true";
      } else {
        modalPreparacion.textContent = plato.preparacion.substring(0, 250) + "...";
        togglePreparacionBtn.textContent = "Ver más";
        togglePreparacionBtn.dataset.expanded = "false";
      }
    };
  } else {
    // Si la preparación es corta, se oculta el botón
    togglePreparacionBtn.style.display = "none";
  }

  // Animaciones de entrada
  modal.style.display = "flex";
  modal.style.animation = "fadeIn 0.3s ease forwards";
  modal.querySelector(".modal-content").style.animation = "slideIn 0.3s ease forwards";
  modalAbierto = true;
}

// Función para cerrar el modal con animaciones de salida
function cerrarModal() {
  modal.style.animation = "fadeOut 0.3s ease forwards";
  modal.querySelector(".modal-content").style.animation = "slideOut 0.3s ease forwards";
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
  modalAbierto = false;
}

// Evento: cerrar modal al presionar la "X"
closeBtn.addEventListener("click", cerrarModal);

// Evento: cerrar modal al hacer clic fuera del contenido
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    cerrarModal();
  }
});

// ----------------------------
// Inicialización
// ----------------------------
// Se cargan los platos por primera vez al abrir la página
obtenerPlatos();
