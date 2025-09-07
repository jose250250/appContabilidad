 $(document).ready(function () {
     mostrarLoading();
     try{
      const actividadesRef = db.collection("actividades");

      // 1. Cargar actividades
      actividadesRef.orderBy("fecha", "desc").get().then(snapshot => {
        snapshot.forEach(doc => {
          const actividad = doc.data();
          $("#selectActividad").append(`
            <option value="${doc.id}">${actividad.nombre} (${actividad.fecha})</option>
          `);
        });
      });
    }catch(err){alert("no se pudo cargar actividades")}
    finally{
      ocultarLoading();
    }

      // 2. Al seleccionar actividad
      $("#selectActividad").change(async function () {
        const actividadId = $(this).val();
        if (actividadId) {
          $("#formGastos").show();
          const actividadRef = db.collection("actividades").doc(actividadId);
          const total = actividadRef.total;
          try {
            const snapshot = await actividadRef.collection("gastos").get();
          
            const gastos = [];
            gastosIds = [];

            snapshot.forEach(doc => {
              gastos.push(doc.data());
              gastosIds.push(doc.id);
            });

            renderGastosForm(gastos);
          } catch (error) {
            console.error("Error al cargar gastos:", error);
          }

        } else {
          $("#formGastos").hide();
        }
      });
   $("#atras").click(function() {
     loadPage("frontActividades", "admin/");
      });


      // 4. Guardar gastos
    // 4. Guardar gastos
// 4. Guardar gastos
$("#formGastos").submit(async function (e) {
  e.preventDefault();

  const actividadId = $("#selectActividad").val();
  const actividadRef = db.collection("actividades").doc(actividadId);
  const filas = $(".gasto-linea");

  const batch = db.batch();
  let cambios = false;
  let totalGastos = 0; // Acumulador de gastos

  for (let i = 0; i < filas.length; i++) {
    const fila = $(filas[i]);
    const nombre = fila.find(".gasto-nombre").val().trim();
    const descripcion = fila.find(".gasto-desc").val().trim();
    const monto = parseFloat(fila.find(".gasto-monto").val()) || 0;

    if (!nombre && !descripcion && !monto) continue;

    const gasto = { nombre, descripcion, monto };

    let gastoRef;
    if (gastosIds[i]) {
      gastoRef = actividadRef.collection("gastos").doc(gastosIds[i]);
    } else {
      gastoRef = actividadRef.collection("gastos").doc();
      gastosIds[i] = gastoRef.id;
    }

    batch.set(gastoRef, gasto);
    totalGastos += monto; // Sumar monto a total de gastos
    console.log("gastos::"+totalGastos);
    cambios = true;
  }

  if (!cambios) {
    alert("Debe ingresar al menos un gasto.");
    return;
  }

  mostrarLoading();
  try {
    // Obtener el total actual de la actividad
    const actividadSnap = await actividadRef.get();
    if (!actividadSnap.exists) throw new Error("Actividad no encontrada.");

    const actividadData = actividadSnap.data();
    const totalActividad = actividadData.total || 0;

    // Calcular ganancia
    const ganancia = totalActividad - totalGastos;

    // Actualizar campos de la actividad
    batch.update(actividadRef, {
      gasto: totalGastos,
      ganancia: ganancia // Campo nuevo para la ganancia
    });

    // Ejecutar batch
    await batch.commit();

    alert("Gastos guardados y ganancia actualizada correctamente.");
    $("#formGastos")[0].reset();
    $("#selectActividad").val("").trigger("change");

  } catch (error) {
    console.error("Error al guardar gastos:", error);
    alert("Error al guardar.");
  } finally {
    ocultarLoading();
  }
});



    });


