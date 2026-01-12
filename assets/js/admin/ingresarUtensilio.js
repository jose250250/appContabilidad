 
 $('#utensilioForm').on('submit', function(e) {
      e.preventDefault();
      mostrarLoading();
     try{
      const cantidad = $('#cantidad').val();
      const nombre = $('#nombre').val().trim();
      const descripcion = $('#descripcion').val();
      const valor = $('#valor').val();
      const estado = $('#estado').val();

      if (!cantidad || !nombre || !descripcion || !valor || !estado) {
        alert('Por favor completa todos los campos');
        return;
      }

      const utensilio = {
        cantidad: parseInt(cantidad),
        nombre,
        descripcion,
        valorEstimado: parseFloat(valor),
        estado,
        fechaRegistro: new Date()
      };

      db.collection('utensilios').add(utensilio)

        .then(() => {
          alert('✅ Utensilio guardado correctamente');
        
        })
        .catch((error) => {
          console.error('Error al guardar:', error);
          alert('❌ Error al guardar el utensilio');
        });
        }finally {
        ocultarLoading(); // ✅ Ocultar spinner
        loadPage("inventario", "admin/");
  }
    });
    $("#btnAtrasInv").click(function(){
        loadPage("inventario", "admin/");
    });