from django.contrib.auth.decorators import login_required, permission_required
from django.shortcuts import render, redirect, get_object_or_404
from .models import Tarea
from .forms import RegistroForm, TareaForm
from django.contrib.auth import login
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import Group


#Funcion de registro
def registro(request):
    if request.method == 'POST':
        form = RegistroForm(request.POST)
        if form.is_valid():
            usuario = form.save()
            usuario.groups.add(Group.objects.get(name='Miembro'))
            login(request, usuario)
            return redirect('lista_tareas')
    else:
        form = RegistroForm()
    return render(request, 'registration/registro.html', {'form': form})
    


@login_required
@permission_required('tareas.view_tarea', raise_exception=True)
def lista_tareas(request):
    tareas = Tarea.objects.all()
    return render(request, 'tareas/lista.html', {'tareas': tareas})
@login_required
@permission_required('tareas.view_tarea', raise_exception=True)
def detalle_tarea(request, pk):
    tarea = get_object_or_404(Tarea, pk=pk)
    return render(request, 'tareas/detalle.html', {'tarea': tarea})

@login_required
@permission_required('tareas.add_tarea', raise_exception=True)
def crear_tarea(request):
    if request.method == 'POST':
        form = TareaForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('lista_tareas')
    else:
        form = TareaForm()

    return render(request, 'tareas/formulario.html', {
        'form': form,
        'titulo': 'Crear tarea',
    })

@login_required
@permission_required('tareas.change_tarea', raise_exception=True)
def editar_tarea(request, pk):
    tarea = get_object_or_404(Tarea, pk=pk)
    if request.method == 'POST':
        form = TareaForm(request.POST, instance=tarea)
        if form.is_valid():
            form.save()
            return redirect('detalle_tarea', pk=tarea.pk)
    else:
        form = TareaForm(instance=tarea)

    return render(request, 'tareas/formulario.html', {
        'form': form,
        'titulo': 'Editar tarea',
        'tarea': tarea,
    })
@login_required
@permission_required('tareas.delete_tarea', raise_exception=True)
def eliminar_tarea(request, pk):
    tarea = get_object_or_404(Tarea, pk=pk)
    if request.method == 'POST':
        tarea.delete()
        return redirect('lista_tareas')

    return render(request, 'tareas/confirmar_eliminacion.html', {'tarea': tarea})

