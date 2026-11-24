document.addEventListener("DOMContentLoaded", () => {
    const PRECIO_BOLETO = 50;
    const TELEFONO_WHATSAPP = "526141160875";

    const LINKS_SORTEOS = [
        {
            titulo: "Sorteo 1",
            subtitulo: "Boletos 1–10",
            url: "https://www.veamoslasfotos.app/projection/sorteo?eventId=6afc98d49d574b4cbe94a185&id=6afc99c19d574b4cbe94c12f"
        },
        { titulo: "Sorteo 2", subtitulo: "Boletos 11–20", url: "" },
        { titulo: "Sorteo 3", subtitulo: "Boletos 21–30", url: "" },
        { titulo: "Sorteo 4", subtitulo: "Boletos 31–40", url: "" },
        { titulo: "Sorteo 5", subtitulo: "Boletos 41–50", url: "" },
        { titulo: "Sorteo 6", subtitulo: "Boletos 51–60", url: "" },
        { titulo: "Sorteo 7", subtitulo: "Boletos 61–70", url: "" },
        { titulo: "Sorteo 8", subtitulo: "Boletos 71–80", url: "" },
        { titulo: "Sorteo 9", subtitulo: "Boletos 81–90", url: "" },
        { titulo: "Sorteo 10", subtitulo: "Boletos 91–100", url: "" },
        { titulo: "🏆 Gran Sorteo Final", subtitulo: "Los 10 finalistas", url: "", esGranSorteo: true }
    ];

    const gridLinksSorteos = document.getElementById("grid-links-sorteos");
    const contenedorDecenas = document.getElementById("contenedor-decenas");
    const contadorBoletosEl = document.getElementById("contador-boletos");
    const totalPagarEl = document.getElementById("total-pagar");
    const btnAbrirModal = document.getElementById("btn-abrir-modal");

    const barraFlotante = document.getElementById("barra-flotante");
    const flotanteCantidadEl = document.getElementById("flotante-cantidad");
    const flotanteTotalEl = document.getElementById("flotante-total");
    const btnLimpiar = document.getElementById("btn-limpiar");
    const btnFlotanteContinuar = document.getElementById("btn-flotante-continuar");

    const modal = document.getElementById("modal-compra");
    const cerrarModal = document.getElementById("cerrar-modal");
    const listaBoletosModalEl = document.getElementById("lista-boletos-modal");
    const rifasCubiertasModalEl = document.getElementById("rifas-cubiertas-modal");
    const totalModalEl = document.getElementById("total-modal");
    const inputNombre = document.getElementById("nombre-comprador");
    const btnWhatsapp = document.getElementById("btn-whatsapp");
    const btnCopiar = document.getElementById("btn-copiar");

    // marcar boletos
    const boletosVendidosIniciales = [1,2,3];
    let boletosOcupados = JSON.parse(localStorage.getItem("boletosOcupados_1_100")) || boletosVendidosIniciales;

    // Arreglo de números elegidos en la selección actual
    let boletosSeleccionados = [];

    // Calcula a qué Mini-Rifa pertenece cada boleto del 1 al 100 (1-10 -> Rifa 1, 11-20 -> Rifa 2, ..., 91-100 -> Rifa 10)
    function obtenerNumeroRifa(numero) {
        return Math.ceil(numero / 10);
    }

    function renderizarLinksSorteos() {
        gridLinksSorteos.innerHTML = "";

        LINKS_SORTEOS.forEach((sorteo) => {
            const tieneLink = Boolean(sorteo.url && sorteo.url.trim() !== "");
            const elemento = document.createElement(tieneLink ? "a" : "div");

            elemento.classList.add("ticket-sorteo", tieneLink ? "activo" : "pendiente");
            if (sorteo.esGranSorteo) {
                elemento.classList.add("gran-sorteo");
            }

            if (tieneLink) {
                elemento.href = sorteo.url;
                elemento.target = "_blank";
                elemento.rel = "noopener noreferrer";
                elemento.title = `Abrir proyección: ${sorteo.titulo}`;
            }

            elemento.innerHTML = `
                <span class="ticket-titulo">${sorteo.titulo}</span>
                <span class="ticket-estado">${tieneLink ? "Ver sorteo ↗" : `${sorteo.subtitulo} • Próximamente`}</span>
            `;

            gridLinksSorteos.appendChild(elemento);
        });
    }

    function renderizarCuadricula() {
        contenedorDecenas.innerHTML = "";

        for (let decena = 0; decena < 10; decena++) {
            const numeroRifa = decena + 1;
            const inicio = decena * 10 + 1;
            const fin = (decena + 1) * 10;

            const filaDiv = document.createElement("div");
            filaDiv.classList.add("fila-decena", decena % 2 === 0 ? "tono-a" : "tono-b");

            const cabecera = document.createElement("div");
            cabecera.classList.add("cabecera-decena");
            cabecera.innerHTML = `
                <span class="titulo-mini-rifa">MINI-RIFA #${numeroRifa}</span>
                <span class="rango-numeros">Boletos del ${inicio} al ${fin}</span>
            `;
            filaDiv.appendChild(cabecera);

            const grid = document.createElement("div");
            grid.classList.add("grid-decena");

            for (let num = inicio; num <= fin; num++) {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.textContent = num;
                btn.classList.add("boleto");

                if (boletosOcupados.includes(num)) {
                    btn.classList.add("vendido");
                    btn.disabled = true;
                    btn.title = `Boleto #${num} no disponible`;
                } else if (boletosSeleccionados.includes(num)) {
                    btn.classList.add("seleccionado");
                    btn.title = `Boleto #${num} seleccionado (clic para quitar)`;
                    btn.addEventListener("click", () => alternarSeleccion(num));
                } else {
                    btn.classList.add("disponible");
                    btn.title = `Mini-Rifa #${numeroRifa} • Boleto #${num} ($${PRECIO_BOLETO} MXN)`;
                    btn.addEventListener("click", () => alternarSeleccion(num));
                }

                grid.appendChild(btn);
            }

            filaDiv.appendChild(grid);
            contenedorDecenas.appendChild(filaDiv);
        }
    }

    function alternarSeleccion(num) {
        if (boletosSeleccionados.includes(num)) {
            boletosSeleccionados = boletosSeleccionados.filter((n) => n !== num);
        } else {
            boletosSeleccionados.push(num);
            boletosSeleccionados.sort((a, b) => a - b);
        }
        actualizarResumenSeleccion();
        renderizarCuadricula();
    }

    function actualizarResumenSeleccion() {
        const cantidad = boletosSeleccionados.length;
        const total = cantidad * PRECIO_BOLETO;
        const textoCantidad = cantidad === 1 ? "1 boleto seleccionado" : `${cantidad} boletos seleccionados`;

        contadorBoletosEl.textContent = textoCantidad;
        totalPagarEl.textContent = `$${total} MXN`;
        btnAbrirModal.disabled = cantidad === 0;

        if (cantidad > 0) {
            barraFlotante.classList.remove("oculto");
            flotanteCantidadEl.textContent = textoCantidad;
            flotanteTotalEl.textContent = `$${total} MXN`;
        } else {
            barraFlotante.classList.add("oculto");
        }
    }

    function abrirModalResumen() {
        if (boletosSeleccionados.length === 0) return;

        const total = boletosSeleccionados.length * PRECIO_BOLETO;
        const boletosFormateados = boletosSeleccionados.map((n) => `#${n}`).join(", ");
        const rifasUnicas = [...new Set(boletosSeleccionados.map((n) => `Mini-Rifa #${obtenerNumeroRifa(n)}`))];

        listaBoletosModalEl.textContent = boletosFormateados;
        rifasCubiertasModalEl.textContent = rifasUnicas.join(", ");
        totalModalEl.textContent = `$${total} MXN`;

        actualizarEnlaceWhatsApp();
        modal.classList.remove("oculto");
    }

    function actualizarEnlaceWhatsApp() {
        const nombre = inputNombre.value.trim();
        const total = boletosSeleccionados.length * PRECIO_BOLETO;
        const boletosFormateados = boletosSeleccionados.map((n) => `#${n}`).join(", ");
        const detalleRifas = boletosSeleccionados
            .map((n) => `#${n} (Mini-Rifa #${obtenerNumeroRifa(n)})`)
            .join(", ");

        const lineaNombre = nombre ? `\n*Nombre:* ${nombre}` : "";
        const mensaje =
            `¡Hola! Quiero apartar los siguientes boletos de la *Gran Rifa de Audífonos* ($50 c/u):` +
            `${lineaNombre}` +
            `\n*Boletos:* ${boletosFormateados}` +
            `\n*Detalle por decena:* ${detalleRifas}` +
            `\n*Total a pagar:* $${total} MXN` +
            `\n\nEnseguida envío mi comprobante de transferencia a BBVA.`;

        btnWhatsapp.href = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
    }

    inputNombre.addEventListener("input", actualizarEnlaceWhatsApp);

    btnAbrirModal.addEventListener("click", abrirModalResumen);
    btnFlotanteContinuar.addEventListener("click", abrirModalResumen);

    btnLimpiar.addEventListener("click", () => {
        boletosSeleccionados = [];
        actualizarResumenSeleccion();
        renderizarCuadricula();
    });

    btnWhatsapp.addEventListener("click", () => {
        boletosSeleccionados.forEach((num) => {
            if (!boletosOcupados.includes(num)) {
                boletosOcupados.push(num);
            }
        });
        localStorage.setItem("boletosOcupados_1_100", JSON.stringify(boletosOcupados));
        boletosSeleccionados = [];
        actualizarResumenSeleccion();
        renderizarCuadricula();
        modal.classList.add("oculto");
    });

    btnCopiar.addEventListener("click", () => {
        const cuenta = document.getElementById("num-cuenta").textContent;
        navigator.clipboard.writeText(cuenta).then(() => {
            btnCopiar.textContent = "¡Número de cuenta copiado!";
            setTimeout(() => {
                btnCopiar.textContent = "Copiar número de cuenta";
            }, 2000);
        });
    });

    cerrarModal.addEventListener("click", () => modal.classList.add("oculto"));
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.add("oculto");
        }
    });

    renderizarLinksSorteos();
    actualizarResumenSeleccion();
    renderizarCuadricula();
});
