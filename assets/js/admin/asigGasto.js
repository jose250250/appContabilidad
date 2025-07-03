  $(document).ready(function () {
    const actividadesRef = firebase.firestore().collection("actividades");

    // 1. Cargar actividades en el select
    actividadesRef.orderBy("fecha", "desc").get().then(snapshot => {
      snapshot.forEach(doc => {
        const actividad = doc.data();
        $("#selectActividad").append(`
          <option value="${doc.id}">${actividad.nombre} (${actividad.fecha})</option>
        `);
      });
    });

    // 2. Mostrar formulario de gastos al seleccionar actividad
    $("#selectActividad").change(function () {
      const actividadId = $(this).val();
      if (actividadId) {
        $("#formGastos").show();
        renderGastosForm(); // Genera las 5 líneas de gasto
      } else {
        $("#formGastos").hide();
      }
    });

    $("#formGastos").submit(async function (e) {
      e.preventDefault();

      const actividadId = $("#selectActividad").val();
      const actividadRef = firebase.firestore().collection("actividades").doc(actividadId);
      const gastos = [];

      const filas = $(".gasto-linea");

      for (let i = 0; i < filas.length; i++) {
        const fila = $(filas[i]);
        const nombre = fila.find(".gasto-nombre").val();
        const descripcion = fila.find(".gasto-desc").val();
        const monto = parseFloat(fila.find(".gasto-monto").val()) || 0;
        const archivoInput = fila.find(".gasto-file")[0];
        const archivo = archivoInput.files[0];

        if (!nombre && !descripcion && !monto && !archivo) continue;

        const gasto = { nombre, descripcion, monto };

        if (archivo) {
          const nombreArchivo = Date.now() + "_" + archivo.name;
          const storageRef = firebase.storage().ref("gastos/" + nombreArchivo);
          try {
            const snapshot = await storageRef.put(archivo);
            const url = await snapshot.ref.getDownloadURL();
            gasto.soporteUrl = url;
          } catch (error) {
            console.error("Error al subir archivo:", error);
            alert("Error al subir un archivo.");
            return;
          }
        }

        gastos.push(gasto);
      }

      if (gastos.length === 0) {
        alert("Debe ingresar al menos un gasto.");
        return;
      }

      try {
        const batch = firebase.firestore().batch();
        gastos.forEach(gasto => {
          const gastoRef = actividadRef.collection("gastos").doc();
          batch.set(gastoRef, gasto);
        });

        await batch.commit();
        alert("Gastos guardados exitosamente.");
        $("#formGastos")[0].reset();
        $("#selectActividad").val("").trigger("change");
      } catch (error) {
        console.error("Error al guardar gastos:", error);
        alert("Ocurrió un error al guardar.");
      }
    });

    // 5. Atrás
    $("#btnAtras").click(function () {
      $("#formGastos").hide();
      $("#selectActividad").val("");
    });
  });

