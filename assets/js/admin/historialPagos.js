$(function () {
  const selectMiembro = $("#selectMiembro");
  const tabla = $("#tablaHistorialPagos");
  const tbody = tabla.find("tbody");

  mostrarLoading();

  // 1. Cargar miembros
  db.collection("miembros")
    .orderBy("nombre")
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const m = doc.data();
        selectMiembro.append(
          `<option value="${doc.id}">${m.nombre} ${m.apellido || ""}</option>`
        );
      });
    })
    .catch(() => alert("Error al cargar miembros"))
    .finally(() => ocultarLoading());

  // 2. Al seleccionar miembro → historial
  selectMiembro.on("change", async function () {
    const miembroId = $(this).val();
    tbody.empty();
    tabla.addClass("d-none");

    if (!miembroId) return;

    let pagosTotales = [];
    mostrarLoading();

    try {
      // Obtener actividades del miembro
      const actividadesSnap = await db
        .collection("miembros")
        .doc(miembroId)
        .collection("actividades")
        .get();

      for (const actDoc of actividadesSnap.docs) {
        const actData = actDoc.data();
        const actividadId = actDoc.id;

        // Obtener datos de la actividad
        const actividadSnap = await db
          .collection("actividades")
          .doc(actividadId)
          .get();

        const actividad = actividadSnap.exists
          ? actividadSnap.data()
          : { nombre: "Actividad eliminada", fecha: "" };

        // Pagos
        const pagosSnap = await db
          .collection("miembros")
          .doc(miembroId)
          .collection("actividades")
          .doc(actividadId)
          .collection("pagos")
          .get();

        pagosSnap.forEach(pagoDoc => {
          const pago = pagoDoc.data();
          pagosTotales.push({
            fecha: pago.fecha?.toDate(),
            monto: pago.monto || 0,
            actividad: `${actividad.nombre} (${actividad.fecha})`
          });
        });
      }

      if (pagosTotales.length === 0) {
        alert("Este miembro no tiene pagos registrados.");
        return;
      }

      // Ordenar por fecha descendente
      pagosTotales.sort((a, b) => b.fecha - a.fecha);

      pagosTotales.forEach(pago => {
        tbody.append(`
          <tr>
            <td>${pago.fecha.toLocaleDateString()} ${pago.fecha.toLocaleTimeString()}</td>
            <td class="text-end">$${pago.monto.toLocaleString()}</td>
            <td>${pago.actividad}</td>
          </tr>
        `);
      });

      tabla.removeClass("d-none");
    } catch (err) {
      console.error("Error al cargar historial:", err);
      alert("No se pudo obtener el historial de pagos.");
    } finally {
      ocultarLoading();
    }
  });

  // Botón atrás
  $("#atrasPagos").click(function () {
    loadPage("frontPagos", "admin/");
  });
});
