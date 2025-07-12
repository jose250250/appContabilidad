$(function(){  
  const selectMiembro = $("#selectMiembro");
    const tabla = $("#tablaHistorialPagos");
    const tbody = tabla.find("tbody");

    mostrarLoading();
    try {
    // 1. Cargar miembros
    db.collection("miembros").orderBy("nombre").get().then(snapshot => {
      snapshot.forEach(doc => {
        const data = doc.data();
        selectMiembro.append(`<option value="${doc.id}">${data.nombre} ${data.apellido}</option>`);
      });
    });
  } catch(err){
    alert("error al cargar miembros");
  }
  finally{
      ocultarLoading();
  }

    // 2. Al seleccionar un miembro, mostrar historial de pagos
    selectMiembro.change(async function () {
      const miembroId = $(this).val();
      tbody.empty();
      tabla.addClass("d-none");

      if (!miembroId) return;

      var pagosTotales = [];
      mostrarLoading();
      try {
        const actividadesSnapshot = await db.collection("actividades").get();

        for (const actividadDoc of actividadesSnapshot.docs) {
          const actividadId = actividadDoc.id;
          const actividadData = actividadDoc.data();

          const pagosSnapshot = await db.collection("actividades")
            .doc(actividadId)
            .collection("miembrosActividad")
            .doc(miembroId)
            .collection("pagos")
            .get();

         

          pagosSnapshot.forEach(pagoDoc => {
            const pago = pagoDoc.data();
            pagosTotales.push({
              fecha: pago.fecha?.toDate(),
              monto: pago.monto,
              actividad: `${actividadData.nombre} (${actividadData.fecha})`
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
    // Ocultar loading y reactivar scroll
    ocultarLoading();
  }
    });
    })
    $("#atrasPagos").click(function(){
    loadPage("pagos", "admin/");
})