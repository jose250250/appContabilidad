$(function(){
  cargarSalidasFondo();
})


// Abrir modal con datos
$(document).on("click", ".btn-editar-salida", function () {
  $("#editarSalidaId").val($(this).data("id"));
  $("#editarFecha").val($(this).data("fecha"));
  $("#editarMotivo").val($(this).data("motivo"));
  $("#editarCantidad").val($(this).data("cantidad"));

  const modal = new bootstrap.Modal(document.getElementById("modalEditarSalida"));
  modal.show();
});

// Guardar cambios del modal
$("#formEditarSalida").submit(async function (e) {
  e.preventDefault();

  const id = $("#editarSalidaId").val();
  const fecha = $("#editarFecha").val();
  const motivo = $("#editarMotivo").val().trim();
  const cantidad = parseFloat($("#editarCantidad").val());

  if (!fecha || !motivo || isNaN(cantidad) || cantidad <= 0) {
    alert("Datos inválidos.");
    return;
  }

  try {
    await firebase.firestore().collection("fondoSalidas").doc(id).update({
      fecha: new Date(fecha),
      motivo,
      cantidad
    });

    const modal = bootstrap.Modal.getInstance(document.getElementById("modalEditarSalida"));
    modal.hide();

    alert("Salida actualizada correctamente.");
    cargarSalidasFondo();

  } catch (error) {
    console.error("Error al actualizar:", error);
    alert("Ocurrió un error al actualizar la salida.");
  }
});

$(document).on("click", ".btn-eliminar-salida", async function () {
  const id = $(this).data("id");

  const confirmar = confirm("¿Está seguro que desea eliminar esta salida?");
  if (!confirmar) return;

  try {
    await firebase.firestore().collection("fondoSalidas").doc(id).delete();
    alert("Salida eliminada correctamente.");
    cargarSalidasFondo(); // Recargar la tabla
  } catch (error) {
    console.error("Error al eliminar salida:", error);
    alert("No se pudo eliminar la salida.");
  }
});




  $("#atras").click(function(){
    loadPage("frontSalida", "admin/");
    });

  // Eventos de los botones
  $("#salidasM").on("click", function () {
    mostrarDiv("div1", this);
  });
  $("#salidasA").on("click", function () {
    mostrarDiv("div2", this);
  });
  $("#salidasMA").on("click", function () {
    mostrarDiv("div3", this);
  });    