$(function(){

$("#btnEstado").click(function(){
     loadPage("estadoFondo", "admin/");
});    
 
$("#btnEntradas").click(function(){
     loadPage("entradasFondo", "admin/");     

})
$("#btnSalidas").click(function(){
     loadPage("salidasFondo", "admin/");     
})
$("#btnAtras").click(function(){
     loadPage("homeAdmin");
})


})