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

    // Todos inician disponibles (vacío). Agrega aquí números ya apartados manualmente si lo deseas.
    const boletosVendidosIniciales = [];
    let boletosOcupados = JSON.parse(localStorage.getItem("boletosOcupados")) || boletosVendidosIniciales;

    // Arreglo de boletos elegidos en la selección actual
    let boletosSeleccionados = [];

    function obtenerNumeroRifa(numeroStr) {
        return parseInt(numeroStr[0], 10) + 1;
    }

    function renderizarCuadricula() {
        contenedorDecenas.innerHTML = "";

        for (let decena = 0; decena < 10; decena++) {
            const numeroRifa = decena + 1;
            const inicio = (decena * 10).toString().padStart(2, "0");
            const fin = (decena * 10 + 9).toString().padStart(2, "0");

            const filaDiv = document.createElement("div");
            filaDiv.classList.add("fila-decena", decena % 2 === 0 ? "tono-a" : "tono-b");

            const cabecera = document.createElement("div");
            cabecera.classList.add("cabecera-decena");
            cabecera.innerHTML = `
                <span class="titulo-mini-rifa">MINI-RIFA #${numeroRifa}</span>
                <span class="rango-numeros">Decena ${inicio} – ${fin}</span>
            `;
            filaDiv.appendChild(cabecera);

            const grid = document.createElement("div");
            grid.classList.add("grid-decena");

            for (let unidad = 0; unidad < 10; unidad++) {
                const num = decena * 10 + unidad;
                const numStr = num.toString().padStart(2, "0");

                const btn = document.createElement("button");
                btn.type = "button";
                btn.textContent = numStr;
                btn.classList.add("boleto");

                if (boletosOcupados.includes(numStr)) {
                    btn.classList.add("vendido");
                    btn.disabled = true;
                    btn.title = `Boleto #${numStr} no disponible`;
                } else if (boletosSeleccionados.includes(numStr)) {
                    btn.classList.add("seleccionado");
                    btn.title = `Boleto #${numStr} seleccionado (clic para quitar)`;
                    btn.addEventListener("click", () => alternarSeleccion(numStr));
                } else {
                    btn.classList.add("disponible");
                    btn.title = `Mini-Rifa #${numeroRifa} • Boleto #${numStr} ($${PRECIO_BOLETO} MXN)`;
                    btn.addEventListener("click", () => alternarSeleccion(numStr));
                }

                grid.appendChild(btn);
            }

            filaDiv.appendChild(grid);
            contenedorDecenas.appendChild(filaDiv);
        }
    }

    function alternarSeleccion(numStr) {
        if (boletosSeleccionados.includes(numStr)) {
            boletosSeleccionados = boletosSeleccionados.filter((n) => n !== numStr);
        } else {
            boletosSeleccionados.push(numStr);
            boletosSeleccionados.sort();
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
        localStorage.setItem("boletosOcupados", JSON.stringify(boletosOcupados));
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
