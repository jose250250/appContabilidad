$(function(){

$("#btnEstado").click(function(){
     loadPage("estadoFondo", "admin/");
});    
 
$("#btnEntradas").click(function(){
     loadPage("frontEntrada", "admin/");     

})
$("#btnSalidas").click(function(){
     loadPage("frontSalida", "admin/");     
})
$("#btnAtras").click(function(){
     loadPage("homeAdmin");
})


})