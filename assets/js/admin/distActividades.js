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

 tablaMiembros.find('tbody').empty(); // Solo borra el cuerpo


  // Agregar cuerpo
  miembrosSnapshot.forEach(doc => {
    let miembro = doc.data();
    let cantidad = asignaciones[doc.id] || '';
    let cantidadNum = parseFloat(cantidad) || 0;
    let total = cantidadNum * precioUnidad;
    
    tablaMiembros.find('tbody').append(`
      <tr>
        <td>${miembro.nombre} ${miembro.apellido}</td>
        <td>
          <input type="number" min="0" class="form-control cantidad-miembro" data-id="${doc.id}" value="${cantidad}">
        </td>
        <td>
          <input type="number" min="0" class="form-control total" data-id="${doc.id}" value="${total.toFixed(2)}" readonly>
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
  let cantidad = parseFloat($(this).val()) || 0;
  let total = cantidad * precioUnidad;
  $(`.total[data-id="${miembroId}"]`).val(total.toFixed(2));

  actualizarTotalesGlobales();
});

// Función para actualizar totales generales
function actualizarTotalesGlobales() {
  let totalUnidades = 0;
  let totalPlata = 0;

  $('.cantidad-miembro').each(function () {
    let cantidad = parseFloat($(this).val()) || 0;
    totalUnidades += cantidad;
    totalPlata += cantidad * precioUnidad;
  });

  $('#totalUnidades').text(totalUnidades);
  $('#totalPlata').text(totalPlata.toFixed(2));
}

// 4. Guardar asignaciones
formAsignaciones.submit(async function (e) {
  e.preventDefault();
  let actividadId = selectActividad.val();
  let actividadRef = db.collection("actividades").doc(actividadId);
  let batch = db.batch();

  $('.cantidad-miembro').each(function () {
    let miembroId = $(this).data('id');
    let cantidad = parseFloat($(this).val()) || 0;
    let deuda = cantidad * precioUnidad;
    let docRef = actividadRef.collection("miembrosActividad").doc(miembroId);
    batch.set(docRef, { cantidad, deuda });
  });

  try {
    await batch.commit();
    alert("Asignaciones guardadas correctamente.");
  } catch (err) {
    console.error("Error al guardar asignaciones:", err);
    alert("Ocurrió un error.");
  }
});

// 5. Botón atrás
$("#atras").click(function () {
  loadPage("frontActividades", "admin/");
});
