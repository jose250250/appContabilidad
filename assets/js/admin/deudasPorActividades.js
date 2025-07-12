// assets/js/admin/deudasPorActividades.js
$(document).ready(() => {
  mostrarLoading();
  const db = firebase.firestore();

  // Cargar actividades en el select
var selectActividad = $("#selectActividad");
selectActividad.empty(); // Limpia el select
selectActividad.append(`<option value="">-- Seleccione --</option>`);

db.collection("actividades")
  .orderBy("fecha", "desc")
  .get()
  .then((snapshot) => {
    snapshot.forEach((doc) => {
      const data = doc.data();
      const nombre = data.nombre || "Sin nombre";
      const fechaTexto = data.fecha || "Sin fecha";
      selectActividad.append(`
        <option value="${doc.id}">${nombre} (${fechaTexto})</option>
      `);
      ocultarLoading();
    });
  })

  .catch((error) => {
    console.error("Error cargando actividades:", error);
  });

  // Al cambiar la actividad
  $("#selectActividad").on("change", function () {
    const actividadId = $(this).val();
    if (actividadId) {
      cargarResumenActividad(actividadId);
    } else {
      limpiarTablas();
    }
  });

  // Botón "Ver todos"
  $("#btnVerTodos").on("click", () => {
    $("#cardTodos").toggleClass("d-none");
  });

  // Botón "Atrás"
  $("#btnVolver").on("click", function () {
    loadPage("frontPagos", "admin/");
  });

  // Función principal
  function cargarResumenActividad(actividadId) {
    mostrarLoading();

    const miembrosRef = db.collection("miembros");
    const actividadRef = db.collection("actividades").doc(actividadId);
    const asignacionesRef = actividadRef.collection("miembrosActividad");

    $("#tablaDeudores tbody").empty();
    $("#tablaTodos tbody").empty();

    let totalTodos = 0;
    let totalDeudores = 0;

    actividadRef.get().then((doc) => {
      const actividad = doc.data();
      const precioUnidad = actividad.precioUnidad || 0;

      asignacionesRef.get().then(async (snapshot) => {
        const promesas = snapshot.docs.map(async (asigDoc) => {
          const asig = asigDoc.data();
          const miembroId = asigDoc.id;

          const miembroSnap = await miembrosRef.doc(miembroId).get();
          const miembro = miembroSnap.data() || {};
          const nombreCompleto = `${miembro.nombre} ${miembro.apellido}`.trim();

          const cantidad = asig.cantidad || 0;
          const total = cantidad * precioUnidad;
          const pagado = asig.totalPagado || 0;
          const saldo = total - pagado;

          const fila = `
            <tr>
              <td>${nombreCompleto}</td>
              <td class="text-end">${cantidad}</td>
              <td class="text-end">$${total.toLocaleString()}</td>
              <td class="text-end">$${pagado.toLocaleString()}</td>
              <td class="text-end fw-bold ${saldo > 0 ? "text-danger" : "text-success"}">
                $${saldo.toLocaleString()}
              </td>
            </tr>
          `;

         if (cantidad > 0){
          $("#tablaTodos tbody").append(fila);
          totalTodos += saldo;
           }

          if (saldo > 0) {
            $("#tablaDeudores tbody").append(fila);
            totalDeudores += saldo;
          }
        });

        await Promise.all(promesas);

        // Fila de total para tabla de deudores
        if (totalDeudores > 0) {
          $("#tablaDeudores tbody").append(`
            <tr class="table-warning fw-bold">
              <td colspan="4" class="text-end">Total Deuda:</td>
              <td class="text-end text-danger">$${totalDeudores.toLocaleString()}</td>
            </tr>
          `);
        }

        // Fila de total para tabla de todos
        $("#tablaTodos tbody").append(`
          <tr class="table-success fw-bold">
            <td colspan="4" class="text-end">Total Saldo (Todos):</td>
            <td class="text-end">$${totalTodos.toLocaleString()}</td>
          </tr>
        `);

        ocultarLoading();
      }).catch((err) => {
        console.error("Error cargando asignaciones:", err);
        ocultarLoading();
      });
    }).catch((err) => {
      console.error("Error cargando actividad:", err);
      ocultarLoading();
    });
  }

  function limpiarTablas() {
    $("#tablaDeudores tbody").empty();
    $("#tablaTodos tbody").empty();
    $("#tablaTodosCard").addClass("d-none");
  }

  // Loading functions (asegúrate que #loadingOverlay existe en tu HTML)
  function mostrarLoading() {
    $("body").css("overflow", "hidden");
    $("#loadingOverlay").fadeIn(200);
  }

  function ocultarLoading() {
    $("body").css("overflow", "auto");
    $("#loadingOverlay").fadeOut(200);
  }
});
