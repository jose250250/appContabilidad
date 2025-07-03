$(function(){
  window.setTimeout(function(){
   $("#user-name").text(mail);
   $("#user-role").text(rol);
  }, 1000);

})
$("#btnCerrarSesion").click(function(){
   firebase.auth().signOut()
    .then(() => {
      loadPage("login");
      loadHeader();
    })
    .catch((error) => {
      alert("Error al cerrar sesión: " + error.message);
    });

})