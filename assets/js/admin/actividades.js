$(document).ready(function () {
  $("#formMiembro").on("submit", function (e) {
    e.preventDefault();

    const nombre = $("#nombre").val().trim();
    const descripcion = $("#descripcion").val().trim();
    const fecha = $("#fecha").val();
    const cantUnidades = parseInt($("#cantUnidades").val());
    const precioUnidad = parseFloat($("#precioUnidad").val());

    if (!nombre || !descripcion || !fecha || isNaN(cantUnidades) || isNaN(precioUnidad)) {
      alert("Por favor completa todos los campos correctamente.");
      return;
    }

    const nuevaActividad = {
      nombre: nombre,
      descripcion: descripcion,
      fecha: fecha,
      cantUnidades: cantUnidades,
      precioUnidad: precioUnidad,
      total: cantUnidades * precioUnidad,
      creada: firebase.firestore.FieldValue.serverTimestamp()
    };

    firebase.firestore().collection("actividades").add(nuevaActividad)
      .then(() => {
        alert("Actividad registrada exitosamente.");
        $("#formMiembro")[0].reset();
      })
      .catch((error) => {
        console.error("Error al guardar:", error);
        alert("Hubo un error al guardar la actividad.");
      });
  });

  // Botón "Atrás"
  $("#atras").on("click", function (e) {
    e.preventDefault();
   loadPage("frontActividades", "admin/");
  });
});
