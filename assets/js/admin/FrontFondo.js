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

$("#btnInventario").click(function(){
     loadPage("inventario", "admin/");     
})

$("#btnAtras").click(function(){
     loadPage("homeAdmin");
})


})