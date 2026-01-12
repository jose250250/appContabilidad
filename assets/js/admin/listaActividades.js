$(document).ready(function () {
  cargarActividades(); // Cargar al iniciar
});

var modalEditar = new bootstrap.Modal(
  document.getElementById("modalEditarActividad")
);

// ===============================
// ABRIR MODAL EDITAR
// ===============================
$(document).on("click", ".btn-editar", function () {
  const fila = $(this).closest("tr");
  const id = fila.data("id");

  const actividadesRef = firebase.firestore().collection("actividades");

  actividadesRef.doc(id).get()
    .then((doc) => {
      if (doc.exists) {
        const A = doc.data();

        $("#edit-id").val(id);
        $("#edit-nombre").val(A.nombre);
        $("#edit-descripcion").val(A.descripcion);
        $("#edit-fecha").val(A.fecha);
        $("#edit-cantUnidades").val(A.cantUnidades);
        $("#edit-precioUnidad").val(A.precioUnidad);
        $("#gasto").val(A.gasto);

        modalEditar.show();
      } else {
        console.error("No se encontró el documento.");
      }
    })
    .catch((error) => {
      console.error("Error al obtener el documento:", error);
    });
});

// ===============================
// GUARDAR CAMBIOS + RECALCULAR
// ===============================
$("#formEditarActividad").submit(async function (e) {
  e.preventDefault();

  const id = $("#edit-id").val();
  const nuevoPrecio = parseFloat($("#edit-precioUnidad").val()) || 0;

  const dataActualizada = {
    nombre: $("#edit-nombre").val().trim(),
    descripcion: $("#edit-descripcion").val().trim(),
    fecha: $("#edit-fecha").val(),
    cantUnidades: parseInt($("#edit-cantUnidades").val()) || 0,
    precioUnidad: nuevoPrecio,
    gasto: parseFloat($("#gasto").val()) || 0,
    fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
  };

  const totalCant = dataActualizada.cantUnidades * nuevoPrecio;
  dataActualizada.total = totalCant;
  dataActualizada.ganancia = totalCant - dataActualizada.gasto;

  try {
    mostrarLoading();

    const db = firebase.firestore();

    // 1️⃣ Actualizar actividad principal
    await db.collection("actividades").doc(id).update(dataActualizada);

    // 2️⃣ Recalcular miembros
    const miembrosSnapshot = await db.collection("miembros").get();

    for (const miembroDoc of miembrosSnapshot.docs) {
      const miembroRef = db.collection("miembros").doc(miembroDoc.id);
      const actividadRef = miembroRef.collection("actividades").doc(id);

      await db.runTransaction(async (tx) => {
        const actSnap = await tx.get(actividadRef);
        if (!actSnap.exists) return;

        const act = actSnap.data();
        const resumen = miembroDoc.data().resumen || {
          total: 0,
          totalPagado: 0
        };

        const cantidad = act.cantidad || 0;
        const totalAnterior = act.total || 0;
        const totalNuevoMiembro = cantidad * nuevoPrecio;

        const deltaTotal = totalNuevoMiembro - totalAnterior;

        // Actualizar actividad del miembro
        tx.update(actividadRef, {
          precioUnidad: nuevoPrecio,
          total: totalNuevoMiembro
        });

        // Actualizar resumen del miembro
        if (deltaTotal !== 0) {
          tx.update(miembroRef, {
            "resumen.total": (resumen.total || 0) + deltaTotal
          });
        }
      });
    }

    alert("Actividad actualizada y recalculada correctamente.");
    modalEditar.hide();
    cargarActividades();

  } catch (err) {
    console.error("Error actualizando actividad:", err);
    alert("Error al actualizar la actividad.");
  } finally {
    ocultarLoading();
  }
});


// ===============================
// ELIMINAR ACTIVIDAD
// (nota: esto sigue usando la estructura antigua)
// ===============================
$(document).on("click", ".btn-eliminar", async function () {
  const fila = $(this).closest("tr");
  const actividadId = fila.data("id");

  if (!confirm("¿Estás seguro de eliminar esta actividad?")) return;

  try {
    mostrarLoading();
    const db = firebase.firestore();

    const miembrosSnap = await db.collection("miembros").get();

    for (const miembroDoc of miembrosSnap.docs) {
      const miembroRef = db.collection("miembros").doc(miembroDoc.id);
      const actividadRef = miembroRef.collection("actividades").doc(actividadId);

      await db.runTransaction(async (tx) => {
        const actSnap = await tx.get(actividadRef);
        if (!actSnap.exists) return;

        const act = actSnap.data();

        // ❌ Si tiene pagos → NO eliminar
        if ((act.totalPagado || 0) > 0) {
          throw new Error(
            "No se puede eliminar una actividad que tiene pagos registrados."
          );
        }

        const resumen = miembroDoc.data().resumen || {
          total: 0,
          totalPagado: 0
        };

        // Restar del resumen
        tx.update(miembroRef, {
          "resumen.total": (resumen.total || 0) - (act.total || 0)
        });

        // Eliminar actividad del miembro
        tx.delete(actividadRef);
      });
    }

    // Eliminar actividad global
    await db.collection("actividades").doc(actividadId).delete();

    alert("Actividad eliminada correctamente.");
    cargarActividades();

  } catch (err) {
    console.error(err.message);
    alert(err.message || "Error al eliminar la actividad.");
  } finally {
    ocultarLoading();
  }
});

// ===============================
$("#atrasLista").click(function () {
  loadPage("frontActividades", "admin/");
});


