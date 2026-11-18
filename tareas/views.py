from django.contrib.auth.decorators import login_required, permission_required
from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.http import require_POST
from . import ia_client
from .ia_client import ServicioIAError
from .models import Tarea
from .forms import RegistroForm, TareaForm
from django.contrib.auth import login
from django.contrib.auth.models import Group
from django.core.management import call_command


def _grupo_miembro():
    """Devuelve el grupo Miembro; si aun no existe, crea los roles."""
    grupo = Group.objects.filter(name='Miembro').first()
    if grupo is None:
        call_command('crear_roles', verbosity=0)
        grupo = Group.objects.get(name='Miembro')
    return grupo


# Funcion de registro
def registro(request):
    if request.method == 'POST':
        form = RegistroForm(request.POST)
        if form.is_valid():
            usuario = form.save()
            usuario.groups.add(_grupo_miembro())
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


@login_required
@permission_required('tareas.view_tarea', raise_exception=True)
@require_POST
def analizar_tarea_ia(request, pk):
    """Pide al microservicio Node.js (Gemini) analizar una tarea.

    Responde 200 aunque la IA falle: la pagina explica el error al usuario.
    """
    tarea = get_object_or_404(Tarea, pk=pk)
    try:
        analisis, error_ia = ia_client.analizar_tarea(tarea), None
    except ServicioIAError as exc:
        analisis, error_ia = None, str(exc)
    return render(request, 'tareas/analisis_ia.html', {
        'tarea': tarea,
        'analisis': analisis,
        'error_ia': error_ia,
    })


@login_required
@permission_required('tareas.view_tarea', raise_exception=True)
@require_POST
def resumen_equipo_ia(request):
    """Resumen del estado del equipo generado con IA a partir de todas las tareas."""
    tareas = list(Tarea.objects.order_by('-id')[:ia_client.LIMITE_TAREAS_RESUMEN])
    resumen, error_ia = None, None
    if not tareas:
        error_ia = 'No hay tareas registradas para resumir.'
    else:
        try:
            resumen = ia_client.resumir_equipo(tareas)
        except ServicioIAError as exc:
            error_ia = str(exc)
    return render(request, 'tareas/resumen_equipo_ia.html', {
        'resumen': resumen,
        'error_ia': error_ia,
    })
