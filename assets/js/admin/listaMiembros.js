

  $(document).ready(function () {
     cargarMiembros();

    // Evento Eliminar
    $("#tablaMiembros").on("click", ".btn-eliminar", function () {
      const id = $(this).closest("tr").data("id");
      if (confirm("¿Estás seguro de eliminar este miembro?")) {
        firebase.firestore().collection("miembros").doc(id).delete()
          .then(() => {
            $(this).closest("tr").remove();
            alert("Miembro eliminado.");
            cargarMiembros();
          })
          .catch((error) => {
            console.error("Error al eliminar:", error);
            alert("No se pudo eliminar el miembro.");
          });
      }
    });


  let idEditar = null;

// Abrir modal y cargar datos al hacer clic en "Editar"
$("#tablaMiembros").on("click", ".btn-editar", function () {
  const id = $(this).closest("tr").data("id");
  idEditar = id;

  firebase.firestore().collection("miembros").doc(id).get()
    .then(doc => {
      if (doc.exists) {
        const m = doc.data();
        $("#miembro-id").val(id);
        $("#edit-nombre").val(m.nombre);
        $("#edit-apellido").val(m.apellido);
        $("#edit-cc").val(m.cc);
        $("#edit-celular").val(m.celular);
        $("#edit-tipoMiembro").val(m.tipoMiembro);

        $("#modalEditarMiembro").modal("show"); // abrir modal
      }
    });
});

// Guardar cambios
$("#btnActualizarMiembro").on("click", function () {
  const id = $("#miembro-id").val();

  const miembroActualizado = {
    nombre: $("#edit-nombre").val(),
    apellido: $("#edit-apellido").val(),
    cc: $("#edit-cc").val(),
    celular: $("#edit-celular").val(),
    tipoMiembro: $("#edit-tipoMiembro").val(),
  };

  firebase.firestore().collection("miembros").doc(id).update(miembroActualizado)
    .then(() => {
      alert("Miembro actualizado correctamente.");
      $("#modalEditarMiembro").modal("hide");
      cargarMiembros();
    })
    .catch((error) => {
      console.error("Error al actualizar:", error);
      alert("Hubo un error al guardar los cambios.");
    });
});

$("#atrasLista").click(function(){
    loadPage("frontMiembros", "admin/");
})

})

