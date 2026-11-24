document.addEventListener("DOMContentLoaded", () => {
    const gridBoletos = document.getElementById("grid-boletos");
    const modal = document.getElementById("modal-compra");
    const cerrarModal = document.getElementById("cerrar-modal");
    const spanNumero = document.getElementById("numero-seleccionado");
    const inputNombre = document.getElementById("nombre-comprador");
    const btnWhatsapp = document.getElementById("btn-whatsapp");
    const btnCopiar = document.getElementById("btn-copiar");

    // CONFIGURACIÓN: Agrega aquí los números que ya fueron elegidos/vendidos
    const boletosVendidosIniciales = ["03", "07", "15", "24", "42", "58", "77", "90"];

    // Cargar boletos guardados en el navegador (o usar los iniciales)
    let boletosOcupados = JSON.parse(localStorage.getItem("boletosOcupados")) || boletosVendidosIniciales;
    let boletoActual = null;

    // Teléfono de WhatsApp (código de país 52 para México + número)
    const telefonoWhatsApp = "526141160875";

    // Generar los 100 boletos (00 al 99)
    function renderizarBoletos() {
        gridBoletos.innerHTML = "";
        for (let i = 0; i < 100; i++) {
            const numeroFormateado = i.toString().padStart(2, "0");
            const btn = document.createElement("button");
            btn.textContent = numeroFormateado;
            btn.classList.add("boleto");

            if (boletosOcupados.includes(numeroFormateado)) {
                btn.classList.add("vendido");
                btn.disabled = true;
                btn.title = "Boleto no disponible";
            } else {
                btn.classList.add("disponible");
                btn.title = "Disponible - Haz clic para apartar";
                btn.addEventListener("click", () => abrirModal(numeroFormateado));
            }

            gridBoletos.appendChild(btn);
        }
    }

    // Abrir ventana de confirmación
    function abrirModal(numero) {
        boletoActual = numero;
        spanNumero.textContent = `#${numero}`;
        actualizarEnlaceWhatsApp();
        modal.classList.remove("oculto");
    }

    // Actualizar mensaje dinámico de WhatsApp con el nombre del comprador
    function actualizarEnlaceWhatsApp() {
        const nombre = inputNombre.value.trim();
        const textoNombre = nombre ? ` Mi nombre es *${nombre}*.` : "";
        const mensaje = `Hola! Quiero confirmar la compra del boleto *#${boletoActual}* de la rifa.${textoNombre} Enseguida envío mi comprobante de transferencia a la cuenta BBVA.`;
        btnWhatsapp.href = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    }

    inputNombre.addEventListener("input", actualizarEnlaceWhatsApp);

    // Al hacer clic en enviar por WhatsApp, marcar el boleto como elegido (gris)
    btnWhatsapp.addEventListener("click", () => {
        if (boletoActual && !boletosOcupados.includes(boletoActual)) {
            boletosOcupados.push(boletoActual);
            localStorage.setItem("boletosOcupados", JSON.stringify(boletosOcupados));
            renderizarBoletos();
        }
        modal.classList.add("oculto");
    });

    // Botón para copiar rápido la tarjeta/cuenta BBVA
    btnCopiar.addEventListener("click", () => {
        const cuenta = document.getElementById("num-cuenta").textContent;
        navigator.clipboard.writeText(cuenta).then(() => {
            btnCopiar.textContent = "¡Cuenta copiada!";
            setTimeout(() => {
                btnCopiar.textContent = "Copiar número de cuenta";
            }, 2000);
        });
    });

    // Cerrar modal con la X o haciendo clic fuera del cuadro
    cerrarModal.addEventListener("click", () => modal.classList.add("oculto"));
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.add("oculto");
        }
    });

    renderizarBoletos();
});
