    var modoEdicion = false;
    var utensilioSeleccionado = null;
   $(function(){

    cargarInventario();
   })

    // Alternar modo edición
    $('#btnEditar').on('click', function() {
      modoEdicion = !modoEdicion;

      if (modoEdicion) {
        $('.editar-col').show();
        $(this).text('❌ Cancelar edición');
        $(this).removeClass('btn-warning').addClass('btn-danger');
      } else {
        $('.editar-col').hide();
        $(this).text('✏️ Editar');
        $(this).removeClass('btn-danger').addClass('btn-warning');
      }
    });

    // Abrir modal al presionar "Editar"
    $(document).on('click', '.btnEditarFila', function() {
      const id = $(this).closest('tr').data('id');
      utensilioSeleccionado = id;

      db.collection('utensilios').doc(id).get()
        .then(doc => {
          if (!doc.exists) return alert('El utensilio no existe');
          const u = doc.data();
          $('#editId').val(id);
          $('#editCantidad').val(u.cantidad);
          $('#editNombre').val(u.nombre);
          $('#editDescripcion').val(u.descripcion);
          $('#editValor').val(u.valorEstimado);
          $('#editEstado').val(u.estado);
          const modal = new bootstrap.Modal(document.getElementById('modalEditar'));
          modal.show();
        })
        .catch(err => console.error(err));
    });

    // Guardar cambios desde el modal
    $('#btnGuardarCambios').on('click', function() {
      const id = $('#editId').val();
      const datosActualizados = {
        cantidad: parseInt($('#editCantidad').val()),
        nombre: $('#editNombre').val().trim(),
        descripcion: $('#editDescripcion').val().trim(),
        valorEstimado: parseFloat($('#editValor').val()),
        estado: $('#editEstado').val(),
        fechaActualizacion: new Date()
      };

      db.collection('utensilios').doc(id).update(datosActualizados)
        .then(() => {
          alert('✅ Cambios guardados correctamente');
          bootstrap.Modal.getInstance(document.getElementById('modalEditar')).hide();
        })
        .catch(err => {
          console.error('Error al actualizar:', err);
          alert('❌ Error al guardar los cambios');
        });
    });

    // Eliminar utensilio
    $(document).on('click', '.btnEliminarFila', function() {
      const id = $(this).closest('tr').data('id');
      if (confirm('¿Seguro que deseas eliminar este utensilio?')) {
        db.collection('utensilios').doc(id).delete()
          .then(() => alert('🗑️ Utensilio eliminado correctamente'))
          .catch(err => {
            console.error('Error al eliminar:', err);
            alert('❌ Error al eliminar el utensilio');
          });
      }
    });
    // Redirección a ingresar nuevo utensilio
    $('#btnNuevo').on('click', () => {
      loadPage("ingresarUtensilio", "admin/"); 
    });

    // Volver atrás
    $('#btnAtras').on('click', () => {
       loadPage("frontFondo", "admin/"); 
    });

  