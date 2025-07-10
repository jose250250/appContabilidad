var selectActividad = $('#selectActividad');
var tablaMiembros = $('#tablaMiembros');
var formAsignaciones = $('#formAsignaciones');
var precioUnidad = 0;

// 1. Cargar actividades en el select
db.collection("actividades").orderBy("fecha", "desc").get().then(snapshot => {
  snapshot.forEach(doc => {
    let data = doc.data();
    selectActividad.append(`<option value="${doc.id}">${data.nombre} (${data.fecha})</option>`);
  });
});

// 2. Al seleccionar actividad
selectActividad.change(async function () {
  let actividadId = $(this).val();
  if (!actividadId) {
    formAsignaciones.hide();
    return;
  }

  let miembrosSnapshot = await db.collection("miembros").get();
  let asignacionesSnapshot = await db.collection("actividades").doc(actividadId).collection("miembrosActividad").get();
  let docSnapshot = await db.collection("actividades").doc(actividadId).get();

  precioUnidad = 0;
  if (docSnapshot.exists) {
    precioUnidad = docSnapshot.data().precioUnidad;
  } else {
    console.log("El documento no existe.");
  }

  let asignaciones = {};
  asignacionesSnapshot.forEach(doc => {
    asignaciones[doc.id] = doc.data().cantidad;
  });

  // ✅ Convertir a array y ordenar por nombre
  let miembros = [];
  miembrosSnapshot.forEach(doc => {
    let data = doc.data();
    miembros.push({
      id: doc.id,
      nombre: data.nombre || '',
      apellido: data.apellido || ''
    });
  });

  miembros.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }));

  // 🧹 Limpiar tabla
  tablaMiembros.find('tbody').empty();

  // 📝 Renderizar miembros ordenados
  miembros.forEach(miembro => {
    let cantidad = asignaciones[miembro.id] || "";
    let deuda = cantidad ? (cantidad * precioUnidad).toFixed(2) : "0.00";

    tablaMiembros.find('tbody').append(`
      <tr>
        <td>${miembro.nombre} ${miembro.apellido}</td>
        <td>
          <input type="text" min="0" inputmode="decimal" class="form-control cantidad-miembro" data-id="${miembro.id}" value="${cantidad}">
        </td>
        <td>
          <input type="number" min="0" class="form-control total" data-id="${miembro.id}" value="${deuda}" readonly>
        </td>
      </tr>
    `);
  });

  actualizarTotalesGlobales(); // Calcula el total al cargar

  formAsignaciones.show();
});

// 3. Recalcular totales individuales y globales al cambiar cantidad
tablaMiembros.on('input', '.cantidad-miembro', function () {
  let miembroId = $(this).data('id');
  let cantidadInput = $(this).val().replace(',', '.');
  let cantidad = parseFloat(cantidadInput) || 0;
  let total = cantidad * precioUnidad;
  $(`.total[data-id="${miembroId}"]`).val(total.toFixed(2));

  actualizarTotalesGlobales();
});

// 4. Función para actualizar totales generales
function actualizarTotalesGlobales() {
  let totalUnidades = 0;
  let totalPlata = 0;

  $('.cantidad-miembro').each(function () {
    let cantidadInput = $(this).val().replace(',', '.');
    let cantidad = parseFloat(cantidadInput) || 0;
    totalUnidades += cantidad;
    totalPlata += cantidad * precioUnidad;
  });

  $('#totalUnidades').text(totalUnidades);
  $('#totalPlata').text(totalPlata.toFixed(2));
}

// 5. Guardar asignaciones
formAsignaciones.submit(async function (e) {
  e.preventDefault();
  let actividadId = selectActividad.val();
  let actividadRef = db.collection("actividades").doc(actividadId);

  try {
    const confirmaciones = [];

    const cambios = [];

    const promises = $('.cantidad-miembro').map(async function () {
      const miembroId = $(this).data('id');
      const cantidadInput = $(this).val().replace(',', '.');
      const nuevaCantidad = parseFloat(cantidadInput) || 0;
      const nuevaDeuda = nuevaCantidad * precioUnidad;
      const docRef = actividadRef.collection("miembrosActividad").doc(miembroId);

      const doc = await docRef.get();

      if (doc.exists) {
        const data = doc.data();
        const cantidadAnterior = data.cantidad || 0;
        const tienePagos = (data.totalPagado || 0) > 0;

        if (cantidadAnterior !== nuevaCantidad) {
          if (tienePagos) {
            // Se guarda para confirmación
            cambios.push({ miembroId, nuevaCantidad, nuevaDeuda, docRef });
          } else {
            // No hay pagos, actualizar directamente
            await docRef.update({ cantidad: nuevaCantidad, deuda: nuevaDeuda });
          }
        }
      } else {
        // Documento nuevo, se crea
        await docRef.set({ cantidad: nuevaCantidad, deuda: nuevaDeuda });
      }
    }).get();

    await Promise.all(promises);

    if (cambios.length > 0) {
      const confirmar = confirm("Algunos miembros tienen pagos registrados. ¿Deseas cambiar igualmente sus asignaciones sin borrar sus pagos?");
      if (!confirmar) return;

      for (const cambio of cambios) {
        await cambio.docRef.update({
          cantidad: cambio.nuevaCantidad,
          deuda: cambio.nuevaDeuda
          // NO se toca totalPagado ni se borra nada
        });
      }
    }

    alert("Asignaciones guardadas correctamente.");
  } catch (err) {
    console.error("Error al guardar asignaciones:", err);
    alert("Ocurrió un error.");
  }
});


// 6. Botón atrás
$("#atras").click(function () {
  loadPage("frontActividades", "admin/");
});
