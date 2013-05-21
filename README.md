Media Manager
=============

The Media Manager project aims to break the borders between servers, desktop computers and mobiles devices such as a tablet or a smartphone.

Media Manager is composed of 2 main parts : a webservice (WS) and a user interface (UI).

The web service exposes an API accessed asynchronously y the UI. All methods have been developed and tested for now on an Linux Ubuntu and might work as the same any Unix system.

The user interface is developed in HTML5, Javascript and CSS. No additional language is used here. As HTML5 specifications are not samely integrated in all browsers, some differences may appear.

# Getting started

Fetch the source code in a proper folder on your media server:

```bash
git clone https://github.com/billou-fr/media-manager.git
```

Create symbolic link in the default Apache2 folder (or simply use your own Virtualhost !):

```bash
sudo ln -s ./web /var/www/media-server
```

Create directories used by the application and manage permissions:

1. Main directory where all media files are located:

```bash
mkdir /usr/local/media-server
```

2. Directory used to store the application data:

```bash
mkdir /etc/media-server
```

3. Log file directory:

```bash
mkdir /var/log/media-server;
chown -R www-data: /var/log/media-server

touch /var/log/media-server/application.log
chown -R www-data: /var/log/media-server/application.log
```