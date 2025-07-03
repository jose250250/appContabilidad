  $(document).ready(function () {
    $("#formMiembro").on("submit", function (e) {
      e.preventDefault();

      const miembro = {
        nombre: $("#nombre").val(),
        apellido: $("#apellido").val(),
        cc: $("#cc").val(),
        fechaNacimiento: $("#fechaNacimiento").val(),
        celular: $("#celular").val(),
        email: $("#email").val(),
        tipoMiembro: $("#tipoMiembro").val(),
        fechaRegistro: firebase.firestore.Timestamp.now()
      };

      firebase.firestore().collection("miembros").add(miembro)
        .then(() => {
          alert("Miembro guardado con éxito.");
          $("#formMiembro")[0].reset();
        })
        .catch((error) => {
          console.error("Error al guardar el miembro:", error);
          alert("Ocurrió un error al guardar.");
        });
    });

    $("#atras").click(function(){
    loadPage("frontMiembros", "admin/");
  });

})
