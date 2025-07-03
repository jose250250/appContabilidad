$(document).ready(() => {
  cargarMiembrosEnSelect();
});
// 2. Crear usuario en Firebase Auth y guardar en Firestore
$("#formCrearUsuario").on("submit", function (e) {
  e.preventDefault();

  const miembroId = $("#miembroSelect").val();
  const email = $("#emailUsuario").val();
  const password = $("#passwordUsuario").val();
  const rol = $("#rolUsuario").val();

  if (!miembroId || !email || !password || !rol) {
    alert("Complete todos los campos.");
    return;
  }

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const uid = userCredential.user.uid;

      // Guardar en colección "usuarios" relacionada al miembro
      return firebase.firestore().collection("usuarios").doc(uid).set({
        email: email,
        rol: rol,
        miembroId: miembroId,
        creado: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      $("#resultadoUsuario").html(`<div class="alert alert-success">Usuario creado exitosamente.</div>`);
      $("#formCrearUsuario")[0].reset();
    })
    .catch(error => {
      console.error("Error:", error);
      $("#resultadoUsuario").html(`<div class="alert alert-danger">Error: ${error.message}</div>`);
    });
});
$("#AtrasUsuario").click(function(){
     loadPage("frontMiembros", "admin/");
})


