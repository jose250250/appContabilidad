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
    loadPage("frontPagos", "admin/");
})
$("#tablaDeudas").on("click", ".btn-agregar-pago", async function () {
  const miembroId = $(this).data("miembro-id");
  const actividadId = $(this).data("actividad-id");

  let abono = prompt("Ingrese el monto del abono:");
  abono = parseFloat(abono);

  if (isNaN(abono) || abono <= 0) {
    alert("Monto inválido.");
    return;
  }

  const miembroRef = firebase.firestore()
    .collection("actividades")
    .doc(actividadId)
    .collection("miembrosActividad")
    .doc(miembroId);

  try {
    await firebase.firestore().runTransaction(async (transaction) => {
      const doc = await transaction.get(miembroRef);

      if (!doc.exists) {
        throw "El documento del miembro no existe.";
      }

      const data = doc.data();
      const totalPagadoAnterior = data.totalPagado || 0;
      const nuevoTotalPagado = totalPagadoAnterior + abono;

      // Actualiza el campo totalPagado
      transaction.update(miembroRef, {
        totalPagado: nuevoTotalPagado
      });

      // Registra el abono en la subcolección "pagos"
      const nuevoPagoRef = miembroRef.collection("pagos").doc();
      transaction.set(nuevoPagoRef, {
        monto: abono,
        fecha: new Date(),
        actividadId: actividadId
      });
    });

    alert("Pago registrado correctamente.");
    cargarDeudas(miembroId); // Vuelve a cargar la tabla para actualizar la deuda

  } catch (error) {
    console.error("Error al registrar el pago:", error);
    alert("No se pudo registrar el pago.");
  }
});
