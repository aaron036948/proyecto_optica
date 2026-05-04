// ============================================
//  BUSCAR.JS — Óptica Pouker
//  Arquitectura: clase BuscarApp
//  Corregido y optimizado — Dev Senior
// ============================================

const PRODUCTOS = [
    // --- MUJER ---
    { nombre: "MOD. 90ROJO",   descripcion: "Acetato Redonda Carey Oliva",           precio: 250, categoria: "mujer",  imagen: "imagenes/gafas-mujeres/90rojo.jpeg"           },
    { nombre: "MOD. 90-ROJO",  descripcion: "Acetato Circular Fucsia Translúcido",    precio: 280, categoria: "mujer",  imagen: "imagenes/gafas-mujeres/90-ROJO.jpeg"          },
    { nombre: "MOD. 118",      descripcion: "Metálica Ovalada Bicolor Rosa-Negro",    precio: 300, categoria: "mujer",  imagen: "imagenes/gafas-mujeres/118-ROSADA-NEGRA.jpeg" },
    { nombre: "MOD. 123",      descripcion: "Acetato Cat-Eye Floral Rosado",          precio: 320, categoria: "mujer",  imagen: "imagenes/gafas-mujeres/123-ROSADO.jpeg"       },

    // --- NIÑOS ---
    { nombre: "MOD. 0001",     descripcion: "Acetato Rectangular Azul Cristal",       precio: 150, categoria: "niños",  imagen: "imagenes/gafas-ninos/0001.jpeg"               },
    { nombre: "MOD. 0002",     descripcion: "Acetato Rectangular Negro-Fucsia",       precio: 150, categoria: "niños",  imagen: "imagenes/gafas-ninos/0002.jpeg"               },
    { nombre: "MOD. 0003",     descripcion: "Acetato Oval Azul Celeste",              precio: 140, categoria: "niños",  imagen: "imagenes/gafas-ninos/0003.jpeg"               },
    { nombre: "MOD. 0004",     descripcion: "Acetato Rectangular Violeta",            precio: 150, categoria: "niños",  imagen: "imagenes/gafas-ninos/0004.jpeg"               },
    { nombre: "MOD. 0005",     descripcion: "Acetato Rectangular Negro",              precio: 130, categoria: "niños",  imagen: "imagenes/gafas-ninos/0005.jpeg"               },

    // --- UNISEX ---
    { nombre: "MOD. 001",      descripcion: "Acetato Rectangular Gris Mármol",        precio: 300, categoria: "unisex", imagen: "imagenes/gafas-unisex/001.jpeg"               },
    { nombre: "MOD. 002",      descripcion: "Acetato Circular Gris Azulado",          precio: 310, categoria: "unisex", imagen: "imagenes/gafas-unisex/002.jpeg"               },
    { nombre: "MOD. 003",      descripcion: "Acetato Rectangular Gris Cristal",       precio: 290, categoria: "unisex", imagen: "imagenes/gafas-unisex/003.jpeg"               },
    { nombre: "MOD. 004",      descripcion: "Acetato Cuadrada Negro Clásico",         precio: 280, categoria: "unisex", imagen: "imagenes/gafas-unisex/004.jpeg"               },
    { nombre: "MOD. 005",      descripcion: "Acetato Cat-Eye Negro",                  precio: 300, categoria: "unisex", imagen: "imagenes/gafas-unisex/005.jpeg"               },

    // --- VARÓN ---
    // FIX: producto MOD. 61-AV1 restaurado (estaba eliminado del array original)
    { nombre: "MOD. 61-AV",    descripcion: "Metal Rectangular Ultrafina Azul Pizarra",precio: 360, categoria: "varón",  imagen: "imagenes/gafas-varones/61-azul-verde.jpeg"    },
    { nombre: "MOD. NEGROS",   descripcion: "Acetato Cuadrada Solar Negro",            precio: 400, categoria: "varón",  imagen: "imagenes/gafas-varones/negros.jpeg"           },
    { nombre: "MOD. SATELLITE",descripcion: "Metal Semirrimless Plata-Negro",          precio: 350, categoria: "varón",  imagen: "imagenes/gafas-varones/SATELLITE-PLATA-NEGRA.jpeg" },
    { nombre: "MOD. WESTON",   descripcion: "Metal Full-Rim Dorado Carey Café",        precio: 420, categoria: "varón",  imagen: "imagenes/gafas-varones/WESTON-DORADA-CAFE.jpeg" },
];

// ============================================
class BuscarApp {

    constructor() {
        this.carrito      = [];
        this.debounceTimer = null;

        this._bindDOM();
        this._bindEventos();
        this._cargarCarrito();
        this.filtrar(); // render inicial
    }

    // ──────────────────────────────────────
    //  DOM
    // ──────────────────────────────────────
    _bindDOM() {
        this.contenedor   = document.getElementById("productos");
        this.contador     = document.getElementById("contador");
        this.input        = document.getElementById("inputBusqueda");
        this.orden        = document.getElementById("orden");
        this.btnBuscar    = document.getElementById("btnBuscar");
        this.btnLimpiar   = document.getElementById("btnLimpiar");
        this.formSub      = document.getElementById("formSuscripcion");
        this.badgeCarrito = document.getElementById("carrito-contador");
        this.checkboxes   = document.querySelectorAll("#grupo-genero input[type='checkbox']");
        // Carrito panel
        this.carritoBtn    = document.getElementById("carritoBtn");
        this.carritoPanel  = document.getElementById("carritoPanel");
        this.carritoCerrar = document.getElementById("carritoCerrar");
        this.carritoLista  = document.getElementById("carritoLista");
        this.carritoFooter = document.getElementById("carritoFooter");
        // Overlay
        this.overlay = document.createElement("div");
        this.overlay.className = "carrito-overlay";
        document.body.appendChild(this.overlay);
    }

    // ──────────────────────────────────────
    //  EVENTOS
    // ──────────────────────────────────────
    _bindEventos() {
        // Buscador con debounce 250ms
        this.input?.addEventListener("input", () => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => this.filtrar(), 250);
        });

        // Botón buscar (enter visual)
        this.btnBuscar?.addEventListener("click", () => this.filtrar());

        // Orden
        this.orden?.addEventListener("change", () => this.filtrar());

        // Checkboxes de género
        this.checkboxes.forEach(cb =>
            cb.addEventListener("change", () => this.filtrar())
        );

        // Limpiar
        this.btnLimpiar?.addEventListener("click", () => this._limpiar());

        // Carrito — abrir/cerrar panel
        this.carritoBtn?.addEventListener("click",  () => this._togglePanel());
        this.carritoBtn?.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") this._togglePanel(); });
        this.carritoCerrar?.addEventListener("click", () => this._cerrarPanel());
        this.overlay?.addEventListener("click", () => this._cerrarPanel());

        // Event delegation para controles dentro del panel carrito
        this.carritoLista?.addEventListener("click", e => {
            const btn = e.target.closest("button[data-accion]");
            if (!btn) return;
            const nombre = btn.dataset.nombre;
            const accion = btn.dataset.accion;
            if (accion === "sumar")    this._cambiarCantidad(nombre, 1);
            if (accion === "restar")   this._cambiarCantidad(nombre, -1);
            if (accion === "eliminar") this._eliminarItem(nombre);
        });

        // Event delegation en el grid de productos
        this.contenedor?.addEventListener("click", e => {
            const btn = e.target.closest(".btn-agregar");
            if (btn) this._agregarAlCarrito(btn.dataset.nombre);
        });

        // Formulario suscripción
        this.formSub?.addEventListener("submit", e => {
            e.preventDefault();
            this._procesarSuscripcion();
        });
    }

    // ──────────────────────────────────────
    //  FILTRAR
    // ──────────────────────────────────────
    filtrar() {
        const texto = this.input.value.toLowerCase().trim();

        // FIX: búsqueda con campos separados (evita falsos positivos por concatenación)
        const generos = [...this.checkboxes]
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        let lista = PRODUCTOS.filter(p => {
            const coincideTexto =
                !texto ||
                p.nombre.toLowerCase().includes(texto)      ||
                p.descripcion.toLowerCase().includes(texto) ||
                p.categoria.toLowerCase().includes(texto);

            const coincideGenero =
                generos.length === 0 ||
                generos.includes(p.categoria);

            return coincideTexto && coincideGenero;
        });

        // Ordenar
        switch (this.orden.value) {
            case "asc":  lista.sort((a, b) => a.precio - b.precio); break;
            case "desc": lista.sort((a, b) => b.precio - a.precio); break;
            // default: orden original del array
        }

        this._renderizar(lista);
    }

    // ──────────────────────────────────────
    //  RENDERIZAR CARDS
    // ──────────────────────────────────────
    _renderizar(lista) {
        this.contenedor.innerHTML = "";

        // FIX: contador se actualiza siempre, incluso cuando lista está vacía
        const total = lista.length;
        this.contador.innerHTML =
            `Productos (<b>${total}</b>) &nbsp;·&nbsp; Se muestran <b>${total}</b> resultados`;

        if (total === 0) {
            this.contenedor.innerHTML = `
                <div class="vacio">
                    <div class="vacio-icono">🔍</div>
                    <p>No se encontraron resultados para tu búsqueda</p>
                </div>`;
            return;
        }

        // DocumentFragment → un solo repaint del DOM
        const fragment = document.createDocumentFragment();

        lista.forEach((p, i) => {
            const card = document.createElement("div");
            card.className = "card";
            card.setAttribute("role", "listitem");
            card.style.animationDelay = `${i * 28}ms`;

            card.innerHTML = `
                <div class="card-img">
                    <img
                        src="${p.imagen}"
                        alt="${p.nombre} — ${p.descripcion}"
                        loading="lazy"
                    >
                    <span class="card-badge">${p.categoria}</span>
                </div>
                <div class="card-nombre">${p.nombre}</div>
                <div class="card-precio">Bs. ${p.precio.toFixed(2)}</div>
                <div class="card-desc">${p.descripcion}</div>
                <button
                    class="btn-agregar"
                    type="button"
                    data-nombre="${p.nombre}"
                    aria-label="Agregar ${p.nombre} al carrito"
                >
                    + Carrito
                </button>`;

            fragment.appendChild(card);
        });

        this.contenedor.appendChild(fragment);
    }

    // ──────────────────────────────────────
    //  PANEL CARRITO
    // ──────────────────────────────────────
    _togglePanel() {
        const abierto = !this.carritoPanel.hidden;
        abierto ? this._cerrarPanel() : this._abrirPanel();
    }

    _abrirPanel() {
        this.carritoPanel.hidden = false;
        this.overlay.classList.add("activo");
        this._renderizarPanel();
    }

    _cerrarPanel() {
        this.carritoPanel.hidden = true;
        this.overlay.classList.remove("activo");
    }

    _renderizarPanel() {
        this.carritoLista.innerHTML  = "";
        this.carritoFooter.innerHTML = "";

        if (this.carrito.length === 0) {
            this.carritoLista.innerHTML = `
                <div class="carrito-vacio">
                    <span>🛒</span>
                    <p>Tu carrito está vacío</p>
                </div>`;
            return;
        }

        const fragment = document.createDocumentFragment();
        let total = 0;

        this.carrito.forEach(item => {
            total += item.precio * item.cantidad;
            const div = document.createElement("div");
            div.className = "carrito-item";
            div.innerHTML = `
                <div class="carrito-item-info">
                    <div class="carrito-item-nombre">${item.nombre}</div>
                    <div class="carrito-item-precio">Bs. ${(item.precio * item.cantidad).toFixed(2)}</div>
                </div>
                <div class="carrito-item-controles">
                    <button data-accion="restar"   data-nombre="${item.nombre}" type="button" aria-label="Reducir cantidad">−</button>
                    <span class="carrito-item-cantidad">${item.cantidad}</span>
                    <button data-accion="sumar"    data-nombre="${item.nombre}" type="button" aria-label="Aumentar cantidad">+</button>
                </div>
                <button class="carrito-item-eliminar" data-accion="eliminar" data-nombre="${item.nombre}" type="button" aria-label="Eliminar">✕</button>`;
            fragment.appendChild(div);
        });

        this.carritoLista.appendChild(fragment);

        this.carritoFooter.innerHTML = `
            <div class="carrito-total">
                <span>Total</span>
                <span>Bs. ${total.toFixed(2)}</span>
            </div>
            <button class="carrito-checkout" type="button">Proceder al pago</button>`;
    }

    // ──────────────────────────────────────
    //  CARRITO — lógica
    // ──────────────────────────────────────
    _agregarAlCarrito(nombre) {
        const item = this.carrito.find(p => p.nombre === nombre);
        if (item) {
            item.cantidad++;
        } else {
            const prod = PRODUCTOS.find(p => p.nombre === nombre);
            if (!prod) return;
            this.carrito.push({ nombre, cantidad: 1, precio: prod.precio });
        }
        this._actualizarBadge();
        this._guardarCarrito();
        // Si el panel está abierto, lo re-renderiza en tiempo real
        if (!this.carritoPanel.hidden) this._renderizarPanel();
    }

    _cambiarCantidad(nombre, delta) {
        const item = this.carrito.find(p => p.nombre === nombre);
        if (!item) return;
        item.cantidad += delta;
        if (item.cantidad <= 0) this._eliminarItem(nombre);
        else {
            this._actualizarBadge();
            this._guardarCarrito();
            this._renderizarPanel();
        }
    }

    _eliminarItem(nombre) {
        this.carrito = this.carrito.filter(p => p.nombre !== nombre);
        this._actualizarBadge();
        this._guardarCarrito();
        this._renderizarPanel();
    }

    _actualizarBadge() {
        if (!this.badgeCarrito) return;
        const total = this.carrito.reduce((acc, p) => acc + p.cantidad, 0);
        this.badgeCarrito.textContent = total;
        // Oculta el badge si está en 0
        this.badgeCarrito.style.display = total > 0 ? "flex" : "none";
    }

    _guardarCarrito() {
        try {
            localStorage.setItem("carrito_optica", JSON.stringify(this.carrito));
        } catch {
            // localStorage puede no estar disponible (modo incógnito estricto)
        }
    }

    _cargarCarrito() {
        try {
            const data = JSON.parse(localStorage.getItem("carrito_optica"));
            if (Array.isArray(data)) {
                this.carrito = data;
                this._actualizarBadge();
            }
        } catch {
            this.carrito = [];
        }
    }

    // ──────────────────────────────────────
    //  LIMPIAR FILTROS
    // ──────────────────────────────────────
    _limpiar() {
        this.input.value  = "";
        this.orden.value  = "default";
        this.checkboxes.forEach(cb => cb.checked = false);
        this.filtrar();
    }

    // ──────────────────────────────────────
    //  SUSCRIPCIÓN
    // ──────────────────────────────────────
    _procesarSuscripcion() {
        const emailInput = this.formSub.querySelector("input[type='email']");
        const email = emailInput?.value.trim();

        // Validación real de formato email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!email || !emailRegex.test(email)) {
            emailInput?.focus();
            return;
        }

        // Aquí iría el fetch() a tu backend o servicio de email
        console.log("Suscripción:", email);
        alert(`✅ ¡Suscrito correctamente con ${email}!`);
        this.formSub.reset();
    }
}

// ============================================
//  INIT — espera a que el DOM esté listo
//  (el script tiene defer, pero por seguridad)
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    new BuscarApp();
});