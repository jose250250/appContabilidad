$("#loginForm").submit(function (e) {
  e.preventDefault();
  const email = $("#email").val();
  const password = $("#password").val();

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Sesión iniciada como:", user.email);
      // Aquí podrías redirigir o mostrar mensaje de éxito
    })
    .catch((error) => {
      console.error("Error al iniciar sesión:", error.message);

      // Mostrar mensaje según el código de error
      switch (error.code) {
        case "auth/user-not-found":
          alert("El correo no está registrado.");
          break;
        case "auth/wrong-password":
          alert("La contraseña es incorrecta.");
          break;
        case "auth/invalid-email":
          alert("El correo no es válido.");
          break;
        default:
          alert("Error al iniciar sesión. Verifica los datos.");
          break;
      }
    });
});
