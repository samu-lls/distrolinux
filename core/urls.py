from django.contrib import admin
from django.urls import path

from catalog import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", views.home, name="home"),
    path("diagrama/", views.diagram, name="diagram"),
    path("distros/<slug:slug>/", views.distro_detail, name="distro_detail"),
    path("quiz/", views.quiz_start, name="quiz_start"),
    path("quiz/pergunta/<int:number>/", views.quiz_question, name="quiz_question"),
    path("quiz/resultado/", views.quiz_result, name="quiz_result"),
]
