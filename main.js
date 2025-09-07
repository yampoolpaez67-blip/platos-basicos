const platos = document.querySelector("#platos");
const buscador = document.querySelector("#buscador");
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

const filtros = {
  criterio: "",
  dificultad: "",
  tiempo_preparacion: "",
  categoria: "",
  mostrar: "todos"
};

const dificultadMap = {
  facil: "Fácil",
  media: "Media",
  dificil: "Difícil"
};

const categoriaMap = {
  desayuno: "Desayuno",
  almuerzo: "Almuerzo",
  cena: "Cena",
  postre: "Postre"
};

const tiempoMap = {
  rapido: "Menos de 15 min",
  medio: "15 - 30 min",
  largo: "Más de 30 min"
};

function getColorDificultad(dificultad) {
  switch (dificultad) {
    case "facil":
      return "verde";
    case "media":
      return "amarillo";
    case "dificil":
      return "rojo";
    default:
      return "gris";
  }
}

function crearPlato(plato_basico) {
  const div = document.createElement("div");
  div.className = "plato";

  // Verificar si el plato está en favoritos
  const esFavorito = favoritos.includes(plato_basico.nombre);

  div.innerHTML = `
    <div class="imagen-container">
      <img src="${plato_basico.imagen}" alt="Plato" class="imagen_plato" />
    </div>    

    <div class="contenedor-favorito">
      <button class="btn-favorito ${esFavorito ? "activo" : ""}" 
              data-nombre="${plato_basico.nombre}" 
              aria-label="Añadir a favoritos">
        <svg class="icono-corazon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                  2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
                  C13.09 3.81 14.76 3 16.5 3
                  19.58 3 22 5.42 22 8.5
                  c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>
    </div>

    <h3 class="titulo_plato">${plato_basico.nombre}</h3>

    <section class="ingredientes">
      <h5>Ingredientes</h5>
      <br/>
      ${plato_basico.ingredientes
      .map((ingrediente) => `<span>- ${ingrediente}</span>`)
      .join("")}
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

  div.querySelector(".ver-receta-btn").addEventListener("click", () => abrirModal(plato_basico));

  // Evento de favoritos
  const btnFav = div.querySelector(".btn-favorito");
  btnFav.addEventListener("click", () => {
    const nombrePlato = plato_basico.nombre;

    if (favoritos.includes(nombrePlato)) {
      favoritos = favoritos.filter((p) => p !== nombrePlato);
      btnFav.classList.remove("activo");
    } else {
      favoritos.push(nombrePlato);
      btnFav.classList.add("activo");
    }

    localStorage.setItem("favoritos", JSON.stringify(favoritos));
  });

  return div;
}

function obtenerPlatos() {
  platos.innerHTML = "";

  const criterio = filtros.criterio.replace(/[0-9]/g, "").toLowerCase().trim();

  let lista = platos_basicos.filter((p) => {
    const enNombre = p.nombre.toLowerCase().includes(criterio);
    const enIngredientes = p.ingredientes.some((ing) =>
      ing.toLowerCase().includes(criterio)
    );

    const matchDificultad = filtros.dificultad
      ? p.dificultad === filtros.dificultad
      : true;

    const matchTiempo = filtros.tiempo_preparacion
      ? p.tiempo_preparacion === filtros.tiempo_preparacion
      : true;

    const matchCategoria = filtros.categoria
      ? p.categoria === filtros.categoria
      : true;

    return (enNombre || enIngredientes) && matchDificultad && matchTiempo && matchCategoria;
  });

  if (filtros.mostrar === "favoritos") {
    lista = lista.filter((p) => favoritos.includes(p.nombre));
  }

  lista.forEach((plato, i) => {
    const card = crearPlato(plato);

    // delay progresivo para que cada plato entre uno detrás de otro
    card.style.animationDelay = `${i * 0.1}s`;

    platos.appendChild(card);
  });
}

buscador.addEventListener("input", (event) => {
  filtros.criterio = event.target.value;
  obtenerPlatos();
});

// Manejo de dropdowns
document.querySelectorAll(".dropdown-btn").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    // Cierra otros dropdowns
    document.querySelectorAll(".dropdown-content").forEach((menu) => {
      if (menu !== this.nextElementSibling) {
        menu.classList.remove("show");
      }
    });
    // Alterna el actual
    this.nextElementSibling.classList.toggle("show");
  });
});

// Cierra los dropdowns si se hace click fuera
window.addEventListener("click", () => {
  document.querySelectorAll(".dropdown-content").forEach((menu) =>
    menu.classList.remove("show")
  );
});

// Captura de selección en filtros
document.querySelectorAll(".dropdown-content span").forEach((item) => {
  item.addEventListener("click", (e) => {
    const value = e.target.getAttribute("data-value");
    const parentBtn = e.target.closest(".dropdown").querySelector(".dropdown-btn .category");
    const filterType = parentBtn.getAttribute("data-filter");

    filtros[filterType] = value;
    parentBtn.textContent = e.target.textContent;

    obtenerPlatos();
  });
});

document.getElementById("reset-filtros").addEventListener("click", () => {
  filtros.criterio = "";
  filtros.dificultad = "";
  filtros.tiempo_preparacion = "";
  filtros.categoria = "";
  buscador.value = "";

  document.querySelectorAll(".dropdown")[1].querySelector(".category").textContent = "Dificultad";
  document.querySelectorAll(".dropdown")[2].querySelector(".category").textContent = "Tiempo de preparación";
  document.querySelectorAll(".dropdown")[3].querySelector(".category").textContent = "Categoría";  

  obtenerPlatos();
});

const modal = document.getElementById("modal-receta");
const modalTitulo = document.getElementById("modal-titulo");
const modalImagen = document.getElementById("modal-imagen");
const modalIngredientes = document.getElementById("modal-ingredientes");
const modalPreparacion = document.getElementById("modal-preparacion");
const togglePreparacionBtn = document.getElementById("toggle-preparacion");
const closeBtn = document.querySelector(".close");

let modalAbierto = false;

// Función para abrir modal
function abrirModal(plato) {
  modalTitulo.textContent = plato.nombre;
  modalImagen.src = plato.imagen;

  modalIngredientes.innerHTML = plato.ingredientes
    .map((ing) => `<span>- ${ing}</span><br>`)
    .join("");

  // Preparación con "ver más"
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
    togglePreparacionBtn.style.display = "none";
  }

  modal.style.display = "flex";
  modal.style.animation = "fadeIn 0.3s ease forwards";
  modal.querySelector(".modal-content").style.animation = "slideIn 0.3s ease forwards";
  modalAbierto = true;
}

// Función cerrar modal
function cerrarModal() {
  modal.style.animation = "fadeOut 0.3s ease forwards";
  modal.querySelector(".modal-content").style.animation = "slideOut 0.3s ease forwards";
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
  modalAbierto = false;
}

// Cerrar con X
closeBtn.addEventListener("click", cerrarModal);

// Cerrar al hacer click fuera
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    cerrarModal();
  }
});

// Inicialización
obtenerPlatos();
