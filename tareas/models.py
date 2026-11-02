from django.db import models


class Tarea(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('proceso', 'En proceso'),
        ('completada', 'Completada'),
    ]

    titulo = models.CharField(max_length=100)
    descripcion = models.TextField()
    responsable = models.CharField(max_length=50)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')

    def __str__(self):
        return self.titulo
