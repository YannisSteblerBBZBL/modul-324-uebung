# Pull the minimal Ubuntu image
FROM nginx:1.29-bookworm

# INFO: Das label "service" muss gesetzt damit kamal deploy funktioniert
#       Der Wert muss gleich sein wie der name `../kamal/config/deploy.yml`
LABEL service="myapp"

# Copy the Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the HTML to the image
COPY src/* /usr/share/nginx/html
