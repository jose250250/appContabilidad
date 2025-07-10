$(document).ready(() => {
  cargarEntradasFondo();
});

// Mostrar modal con los datos cargados
$(document).on("click", ".btn-editar", function () {
  const id = $(this).data("id");

  firebase.firestore().collection("fondoEntradas").doc(id).get()
    .then(doc => {
      if (!doc.exists) {
        alert("Entrada no encontrada.");
        return;
      }

      const data = doc.data();
      const fecha = data.fecha?.toDate().toISOString().split("T")[0] || "";
      const motivo = data.descripcion;
      const tipo = data.tipo || "";
      const cantidad = data.cantidad || 0;

      $("#entradaIdEditar").val(id);
      $("#fechaEditar").val(fecha);
      $("#motivoEditar").val(motivo);
      $("#tipoEditar").val(tipo);
      $("#cantidadEditar").val(cantidad);

      const modal = new bootstrap.Modal(document.getElementById("modalEditarEntrada"));
      modal.show();
    })
    .catch(error => {
      console.error("Error al cargar entrada:", error);
      alert("No se pudo cargar la entrada para editar.");
    });
});



$("#formEditarEntrada").submit(function (e) {
  e.preventDefault();

  const entradaId = $("#entradaIdEditar").val();
  const fechaRaw = $("#fechaEditar").val();
  const nuevaFecha = fechaRaw ? new Date(fechaRaw) : null;
  const nuevoMotivo =  $("#motivoEditar").val();
  const nuevoTipo = $("#tipoEditar").val();
  const nuevaCantidad = parseFloat($("#cantidadEditar").val());

  if (!entradaId ||!nuevoMotivo || !nuevaFecha || isNaN(nuevaCantidad)) {
    alert("Por favor completa todos los campos correctamente.");
    return;
  }

  firebase.firestore().collection("fondoEntradas").doc(entradaId).update({
    fecha: nuevaFecha,
    descripcion: nuevoMotivo,
    tipo: nuevoTipo,
    cantidad: nuevaCantidad
  }).then(() => {
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalEditarEntrada"));
    modal.hide();
    cargarEntradasFondo();
    alert("Entrada actualizada correctamente.");
  }).catch(err => {
    console.error("Error al actualizar:", err);
    alert("No se pudo actualizar.");
  });
});


$(document).on("click", ".btn-eliminar", async function () {
  const id = $(this).data("id");

  const confirmar = confirm("¿Está seguro que desea eliminar esta entrada?");
  if (!confirmar) return;

  try {
    await firebase.firestore().collection("fondoEntradas").doc(id).delete();
    alert("Entrada eliminada correctamente.");
    cargarEntradasFondo(); // Recargar la lista
  } catch (error) {
    console.error("Error al eliminar entrada:", error);
    alert("No se pudo eliminar la entrada.");
  }
});


$("#atrasent").click(function(){
     loadPage("frontEntrada", "admin/");
})