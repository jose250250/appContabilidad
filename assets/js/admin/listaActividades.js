$(document).ready(function () {
  cargarActividades(); // Cargar al iniciar
});
var modalEditar = new bootstrap.Modal(document.getElementById("modalEditarActividad"));

$(document).on("click", ".btn-editar", function () {
  const fila = $(this).closest("tr");
  const id = fila.data("id");

  const actividadesRef = firebase.firestore().collection("actividades");  
  actividadesRef.doc(id).get().then((doc) => {
    if (doc.exists) {
      const A = doc.data();

      // Rellenar el modal
      $("#edit-id").val(id); // ID tomado desde el `data-id` de la fila
      $("#edit-nombre").val(A.nombre);
      $("#edit-descripcion").val(A.descripcion);
      $("#edit-fecha").val(A.fecha);
      $("#edit-cantUnidades").val(A.cantUnidades);
      $("#edit-precioUnidad").val(A.precioUnidad);

      modalEditar.show();
    } else {
      console.error("No se encontró el documento.");
    }
  }).catch((error) => {
    console.error("Error al obtener el documento:", error);
  });
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

