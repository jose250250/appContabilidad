$(function(){


  $("#btnVerLista").click(function(){
    loadPage("listaActividadesU", "usuario/");
 })
 $("#btnDeudaMiembro").click(function(){
     loadPage("deudasMiembrosU", "usuario/");     
})

 $("#btnDeudaActividad").click(function(){
     loadPage("deudasPorActividadU", "usuario/");     
})

    $("#btnAtras").click(function(){
    loadPage("homeUsuario", "usuario/");
})


})