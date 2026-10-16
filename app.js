document.addEventListener("DOMContentLoaded", () => {
    // Estado donde guardamos los turnos agendados en memoria
    // Formato de clave: "TIPO_FECHA_HORA" (ej: "OS_2026-10-20_09:30")
    const turnosReservados = new Set();

    // Rango horario de atención (08:00 a 17:00 hs)
    const HORA_INICIO = 8;
    const HORA_FIN = 17;

    // Elementos del DOM
    const fechaInputOS = document.getElementById("fecha-os");
    const fechaInputMed = document.getElementById("fecha-med");
    const horaSelectOS = document.getElementById("hora-os");
    const horaSelectMed = document.getElementById("hora-med");

    const formOS = document.getElementById("form-obra-social");
    const formMed = document.getElementById("form-medico");

    // 1. Restringir calendario para no permitir fechas pasadas
    const obtenerFechaHoy = () => {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const fechaHoy = obtenerFechaHoy();
    fechaInputOS.min = fechaHoy;
    fechaInputMed.min = fechaHoy;

    // 2. Generar horarios cada 30 minutos
    const generarHorariosBase = () => {
        const horarios = [];
        for (let h = HORA_INICIO; h < HORA_FIN; h++) {
            const horaStr = String(h).padStart(2, '0');
            horarios.push(`${horaStr}:00`);
            horarios.push(`${horaStr}:30`);
        }
        return horarios;
    };

    const listaHorariosBase = generarHorariosBase();

    // 3. Renderizar select de horas filtrando las que ya están pisadas/reservadas
    const actualizarSelectHorarios = (tipo, fecha, selectElement) => {
        selectElement.innerHTML = '';

        if (!fecha) {
            selectElement.innerHTML = '<option value="">Selecciona primero una fecha</option>';
            return;
        }

        const opcionesDisponibles = listaHorariosBase.filter(hora => {
            const claveTurno = `${tipo}_${fecha}_${hora}`;
            return !turnosReservados.has(claveTurno);
        });

        if (opcionesDisponibles.length === 0) {
            selectElement.innerHTML = '<option value="">Sin turnos disponibles para esta fecha</option>';
            return;
        }

        selectElement.innerHTML = '<option value="">Selecciona un horario</option>';
        opcionesDisponibles.forEach(hora => {
            const option = document.createElement("option");
            option.value = hora;
            option.textContent = `${hora} hs`;
            selectElement.appendChild(option);
        });
    };

    // Eventos al cambiar la fecha en los formularios
    fechaInputOS.addEventListener("change", (e) => {
        actualizarSelectHorarios("OS", e.target.value, horaSelectOS);
    });

    fechaInputMed.addEventListener("change", (e) => {
        actualizarSelectHorarios("MED", e.target.value, horaSelectMed);
    });

    // 4. Manejar el guardado de turnos
    const agendarTurno = (e, tipo, form, listaUl, fechaInput, horaSelect) => {
        e.preventDefault();

        const fecha = fechaInput.value;
        const hora = horaSelect.value;

        if (!fecha || !hora) {
            alert("Por favor completa la fecha y selecciona un horario.");
            return;
        }

        const claveTurno = `${tipo}_${fecha}_${hora}`;

        // Validación doble de seguridad contra solapamiento
        if (turnosReservados.has(claveTurno)) {
            alert("¡Error! Este turno ya fue ocupado recién. Elige otro horario.");
            actualizarSelectHorarios(tipo, fecha, horaSelect);
            return;
        }

        // Marcar turno como ocupado
        turnosReservados.add(claveTurno);

        // Obtener datos según el formulario
        let detalle = "";
        if (tipo === "OS") {
            const nombre = document.getElementById("nombre-os").value;
            const tramite = document.getElementById("tramite-os").value;
            detalle = `<strong>${nombre}</strong> - ${tramite}`;
        } else {
            const nombre = document.getElementById("nombre-med").value;
            const especialidad = document.getElementById("especialidad-med").value;
            detalle = `<strong>${nombre}</strong> - ${especialidad}`;
        }

        // Renderizar en la lista visual del panel
        const li = document.createElement("li");
        li.className = "item-turno";
        li.innerHTML = `<span>${detalle}</span> <span>📅 ${fecha} | ⏰ ${hora} hs</span>`;
        listaUl.appendChild(li);

        // Limpiar formulario y refrescar horarios
        form.reset();
        actualizarSelectHorarios(tipo, fecha, horaSelect);
        alert("Turno reservado con éxito.");
    };

    // Event Listeners para los Submit
    formOS.addEventListener("submit", (e) => {
        agendarTurno(e, "OS", formOS, document.getElementById("lista-os"), fechaInputOS, horaSelectOS);
    });

    formMed.addEventListener("submit", (e) => {
        agendarTurno(e, "MED", formMed, document.getElementById("lista-med"), fechaInputMed, horaSelectMed);
    });
});
