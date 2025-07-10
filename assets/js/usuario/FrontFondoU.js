$(function(){

$("#btnEstado").click(function(){
     loadPage("estadoFondoU", "usuario/");
});    
 
$("#btnEntradas").click(function(){
     loadPage("frontEntradaU", "usuario/");     

})
$("#btnSalidas").click(function(){
     loadPage("frontSalidaU", "usuario/");     
})
$("#btnAtras").click(function(){
     loadPage("homeUsuario", "usuario/");
})


})