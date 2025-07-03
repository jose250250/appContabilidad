$(function(){
loadHeader();
loadFooter();






})

    // Guardar visitante
    $("#formulario").submit(function (e) {
      e.preventDefault();
      const nombre = $("#nombre").val();
      const email = $("#email").val();

      db.collection("visitantes").add({ nombre, email })
        .then(() => {
          alert("¡Visitante guardado!");
          $("#formulario")[0].reset();
          cargarVisitantes();
        })
        .catch((error) => {
          alert("Error al guardar: " + error);
        });
    });

    // Cargar lista de visitantes
    function cargarVisitantes() {
      $("#lista").empty();
      db.collection("visitantes").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          $("#lista").append(`<li>${data.nombre} (${data.email})</li>`);
        });
      });
    }

   
