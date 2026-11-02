from django.shortcuts import render, redirect, get_object_or_404
from .models import Tarea
from .forms import TareaForm


def lista_tareas(request):
    tareas = Tarea.objects.all()
    return render(request, 'tareas/lista.html', {'tareas': tareas})


def detalle_tarea(request, pk):
    tarea = get_object_or_404(Tarea, pk=pk)
    return render(request, 'tareas/detalle.html', {'tarea': tarea})


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


def eliminar_tarea(request, pk):
    tarea = get_object_or_404(Tarea, pk=pk)
    if request.method == 'POST':
        tarea.delete()
        return redirect('lista_tareas')

    return render(request, 'tareas/confirmar_eliminacion.html', {'tarea': tarea})

