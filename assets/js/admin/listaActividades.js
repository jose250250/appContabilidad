$(document).ready(function () {
  cargarActividades(); // Cargar al iniciar
});
let modalEditar = new bootstrap.Modal(document.getElementById("modalEditarActividad"));

$(document).on("click", ".btn-editar", function () {
  const fila = $(this).closest("tr");
  const id = fila.data("id");

  // Obtener datos de la fila
  const nombre = fila.find("td:eq(0)").text();
  const descripcion = fila.find("td:eq(1)").text();
  const fecha = fila.find("td:eq(2)").text();
  const cantUnidades = fila.find("td:eq(3)").text();
  const precioUnidad = fila.find("td:eq(4)").text().replace("$", "");

  // Rellenar el modal
  $("#edit-id").val(id);
  $("#edit-nombre").val(nombre);
  $("#edit-descripcion").val(descripcion);
  $("#edit-fecha").val(fecha);
  $("#edit-cantUnidades").val(cantUnidades);
  $("#edit-precioUnidad").val(precioUnidad);

  modalEditar.show();
});

// Guardar cambios
$("#formEditarActividad").submit(function (e) {
  e.preventDefault();

  const id = $("#edit-id").val();
  const dataActualizada = {
    nombre: $("#edit-nombre").val().trim(),
    descripcion: $("#edit-descripcion").val().trim(),
    fecha: $("#edit-fecha").val(),
    cantUnidades: parseInt($("#edit-cantUnidades").val()),
    precioUnidad: parseFloat($("#edit-precioUnidad").val()),
  };

  dataActualizada.total = dataActualizada.cantUnidades * dataActualizada.precioUnidad;

  firebase.firestore().collection("actividades").doc(id).update(dataActualizada)
    .then(() => {
      alert("Actividad actualizada correctamente.");
      modalEditar.hide();
      cargarActividades(); // recargar la lista
    })
    .catch(err => {
      console.error("Error actualizando:", err);
      alert("Error al actualizar la actividad.");
    });
});

$(document).on("click", ".btn-eliminar", async function () {
  const fila = $(this).closest("tr");
  const actividadId = fila.data("id");

  if (!confirm("¿Estás seguro de eliminar esta actividad con todas sus asignaciones y pagos?")) return;

  const actividadRef = firebase.firestore().collection("actividades").doc(actividadId);
  const miembrosRef = actividadRef.collection("miembrosActividad");

  try {
    const miembrosSnap = await miembrosRef.get();

    // Recorremos cada miembro
    for (const miembroDoc of miembrosSnap.docs) {
      const miembroId = miembroDoc.id;
      const pagosRef = miembrosRef.doc(miembroId).collection("pagos");
      const pagosSnap = await pagosRef.get();

      // Borramos todos los pagos del miembro
      for (const pagoDoc of pagosSnap.docs) {
        await pagosRef.doc(pagoDoc.id).delete();
      }

      // Borramos el documento del miembro
      await miembrosRef.doc(miembroId).delete();
    }

    // Finalmente borramos la actividad
    await actividadRef.delete();

    alert("Actividad eliminada correctamente.");
    cargarActividades(); // Actualiza la tabla
  } catch (err) {
    console.error("Error al eliminar actividad:", err);
    alert("Error al eliminar la actividad.");
  }
});



$("#atrasLista").click(function(){
    loadPage("frontActividades", "admin/");
})

