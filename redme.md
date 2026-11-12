   --docker compose up --build
   ---para correr en docker
   docker compose up -d
--Cada vez que se corriga algo

docker compose up --build -d

   --Comando para crear un super admin
   docker compose exec web python manage.py createsuperuser