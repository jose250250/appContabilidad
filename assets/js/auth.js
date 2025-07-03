   $("#loginForm").submit(function (e) {
      e.preventDefault();
      const email = $("#email").val();
      const password = $("#password").val();

    firebase.auth().signInWithEmailAndPassword(email, password)
   .then((userCredential) => {
    const user = userCredential.user;
    console.log("Sesión iniciada como:", user.email);
    loadPage("homeAdmin")
    // Redirige a la página principal
  
  })
  .catch((error) => {
    console.error("Error al iniciar sesión:", error.message);
  });

    });