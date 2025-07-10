$(function(){
    cargarMiembros2();
})

var miembrosSelect = $("#miembrosSelect"); // ✅ ahora es objeto jQuery
miembrosSelect.off("change").on("change", function () {
  const miembroId = $(this).val();
  const miembroNombre = $(this).find("option:selected").text();
  if (miembroId) {
    cargarDeudas(miembroId, miembroNombre);
  }
});
$("#btnHistorialPagos").click(function(){
    loadPage("historialPagos", "admin/");
})
$("#atrasPa").click(function(){
  accionPago = null;
  miembroIdSeleccionado = null;
  actividadIdSeleccionada = null;
  totalActualPagado = 0;
  $("#inputMonto").val(""); // limpiar el campo también si quieres

  
    loadPage("frontPagos", "admin/");
})


var modal = new bootstrap.Modal(document.getElementById('modalMonto'));

// Declarar una vez al principio del script
var accionPago;
var miembroIdSeleccionado;
var actividadIdSeleccionada;
var totalActualPagado;

$("#tablaDeudas").on("click", ".btn-agregar-pago", function () {
  accionPago = "agregar";
  miembroIdSeleccionado = $(this).data("miembro-id");
  actividadIdSeleccionada = $(this).data("actividad-id");
  $("#modalMontoLabel").text("Ingrese el monto del abono");
  $("#inputMonto").val("").attr("min", 0);
  modal.show();
});

$("#tablaDeudas").on("click", ".btn-editar-pago", async function () {
  accionPago = "editar";
  miembroIdSeleccionado = $(this).data("miembro-id");
  actividadIdSeleccionada = $(this).data("actividad-id");

  const miembroRef = firebase.firestore()
    .collection("actividades")
    .doc(actividadIdSeleccionada)
    .collection("miembrosActividad")
    .doc(miembroIdSeleccionado);

  const doc = await miembroRef.get();
  if (!doc.exists) {
    alert("No se encontró el registro del miembro.");
    return;
  }

  totalActualPagado = doc.data().totalPagado || 0;
  $("#modalMontoLabel").text("Editar total pagado");
  $("#inputMonto").val(totalActualPagado).attr("min", 0);
  modal.show();
});

$("#formModalMonto").submit(async function (e) {
  e.preventDefault();
  let monto = parseFloat($("#inputMonto").val());

  if (isNaN(monto) || monto < 0) {
    alert("Monto inválido.");
    return;
  }

  const miembroRef = firebase.firestore()
    .collection("actividades")
    .doc(actividadIdSeleccionada)
    .collection("miembrosActividad")
    .doc(miembroIdSeleccionado);

  try {
    if (accionPago === "agregar") {
      await firebase.firestore().runTransaction(async (transaction) => {
        const doc = await transaction.get(miembroRef);
        if (!doc.exists) throw "El documento del miembro no existe.";

        const data = doc.data();
        const totalPagadoAnterior = data.totalPagado || 0;
        const nuevoTotalPagado = totalPagadoAnterior + monto;

        transaction.update(miembroRef, { totalPagado: nuevoTotalPagado });

        const nuevoPagoRef = miembroRef.collection("pagos").doc();
        transaction.set(nuevoPagoRef, {
          monto,
          fecha: new Date(),
          actividadId: actividadIdSeleccionada
        });
      });
      alert("Pago registrado correctamente.");
    } else if (accionPago === "editar") {
      await miembroRef.update({ totalPagado: monto });
      alert("Total pagado actualizado.");
    }

    modal.hide();
    cargarDeudas(miembroIdSeleccionado);

  } catch (error) {
    console.error("Error al guardar:", error);
    alert("No se pudo guardar el monto.");
  }
});



