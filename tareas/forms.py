from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import Tarea


class TareaForm(forms.ModelForm):
    class Meta:
        model = Tarea
        fields = ['titulo', 'descripcion', 'responsable', 'estado']


class RegistroForm(UserCreationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].label = 'Elige tu usuario'
        self.fields['username'].help_text = 'Puedes usar letras, números y los símbolos @ . + - _'
        self.fields['password1'].label = 'Crea una contraseña'
        self.fields['password1'].help_text = 'Usa al menos 8 caracteres, mezclando letras y números.'
        self.fields['password2'].label = 'Repite la contraseña'
        self.fields['password2'].help_text = 'Debe ser igual a la anterior.'