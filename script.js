document.addEventListener("DOMContentLoaded", () => {
    const PRECIO_BOLETO = 50;
    const TELEFONO_WHATSAPP = "526141160875";

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

    // BOLETOS VENDIDOS / APARTADOS
    const boletosVendidosIniciales = [3,13,23,33,43,53,63,73,83,93];

    let boletosOcupados = [...boletosVendidosIniciales];
    let boletosSeleccionados = [];

    function obtenerNumeroRifa(numero) {
        return Math.ceil(numero / 10);
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
        if (boletosOcupados.includes(num)) return;

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

    actualizarResumenSeleccion();
    renderizarCuadricula();
});
