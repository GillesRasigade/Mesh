#!/bin/bash
# ===================================================
# Media Manager v0.1
# https://github.com/billou-fr/media-manager/
# ===================================================
# Copyright 2013 Gilles Rasigade
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ==========================================================

echo -e "* * * * * * * * * * * * * * * * * * * *"
echo -e "Mesh installer";
echo -e "* * * * * * * * * * * * * * * * * * * *\n"

TEMPLATE="MESH.config.ini.template";









# Testing git existence:
t=$(which git);
if [ "$t" == "" ]; then
    echo "git package not found"
    sudo apt-get install git
else
    echo "git correctly installed"
fi

# Testing apache existence:
t=$(which apache2);
if [ "$t" == "" ]; then
    echo "apache2 package not found"
    sudo apt-get install apache2
else
    echo "apache2 correctly installed"
fi

# Testing php existence:
t=$(which php);
if [ "$t" == "" ]; then
    echo "php package not found"
    sudo apt-get install php5 libapache2-mod-php5
else
    echo "php correctly installed"
fi

# PHP5 GD library installation:
t=$(dpkg --get-selections | grep php5-gd);
if [ "$t" == "" ]; then
    echo "php5-gd package not found"
    sudo apt-get install php5-gd
else
    echo "php correctly installed"
fi

# FFMPEG installation/update:
t=$(dpkg --get-selections | grep ffmpeg);
if [ "$t" == "" ]; then
    echo "ffmpeg package not found"
    sudo apt-get remove ffmpeg x264 libx264-dev
    sudo apt-get update
    sudo apt-get install ffmpeg x264 libx264-dev
    #sudo apt-get install libavcodec-extra-52 libavdevice-extra-52 libavfilter-extra-0 libavformat-extra-52 libavutil-extra-49 libpostproc-extra-51 libswscale-extra-0
else
    echo "ffmpeg correctly installed"
fi

# Image Magick (dev) installation:
t=$(dpkg --get-selections | grep imagemagick);
if [ "$t" == "" ]; then
    echo "imagemagick package not found"
    sudo apt-get install libmagickwand-dev imagemagick
else
    echo "imagemagick correctly installed"
fi

# VLC installation:
t=$(dpkg --get-selections | grep vlc);
if [ "$t" == "" ]; then
    echo "vlc package not found"
    sudo add-apt-repository ppa:videolan/stable-daily
    sudo apt-get update
    sudo apt-get install vlc browser-plugin-vlc libavcodec-extra-53
else
    echo "vlc correctly installed"
fi

# Ghost Script installation:
t=$(dpkg --get-selections | grep ghostscript);
if [ "$t" == "" ]; then
    echo "ghostscript package not found"
    sudo apt-get install ghostscript libgs-dev
else
    echo "ghostscript correctly installed"
fi

# Apache restarting:
sudo /etc/init.d/apache2 restart

# Clone git project:
#git clone https://github.com/billou-fr/media-manager.git
read -p "Clone github project here? " -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f install-linux.sh
    git clone https://github.com/billou-fr/media-manager.git ./
else
    echo "Project not cloned.";
    echo "Please move the command line to the app/ folder of the MESH";
    echo "source code project and execute the script install-linux.sh";
    exit;
fi




p=$(find -name $TEMPLATE | sed -r "s,/[^/]*$,,")


# Building the main configuration file:
pwd=$(pwd)
cd "$p"
rm config.ini.pre
cp $TEMPLATE config.ini.pre

path=$(grep -r ^path config.ini.pre | sed "s/.*=//" | sed "s/'//g" );
data=$(grep -r ^data config.ini.pre | sed "s/.*=//" | sed "s/'//g" );
logs=$(grep -r ^logs config.ini.pre | sed "s/.*=//" | sed "s/'//g" );

echo -e "Enter the MESH main files location and press [ENTER]:"
read -e -p ">> " -i "$path" path

echo -e "Enter the MESH data files location and press [ENTER]:"
read -e -p ">> " -i "$data" data

echo -e "Enter the MESH log file location and press [ENTER]:"
read -e -p ">> " -i "$logs" logs

sed -i "s,path.*=.*,path='$path'," config.ini.pre
sed -i "s,data.*=.*,data='$data'," config.ini.pre
sed -i "s,logs.*=.*,logs='$logs'," config.ini.pre

cat config.ini.pre

# TODO: add here the last save config.ini process with prompt question.
read -p "Do I install this configuration file? " -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    mv config.ini $(date +%F)".config.ini"
    mv config.ini.pre config.ini
else
    echo "Please read and rename the file config.ini.pre into config.ini to end the MESH installation."
fi















# Check folders existence and permissions:
if [ ! -d "$path" ]; then
    sudo mkdir -p "$path";
fi

if [ ! -d "$data" ]; then
    sudo mkdir -p "$data";
    sudo chown www-data: "$data";
fi

if [ ! -f "$logs" ]; then
    l="$(echo "$logs" | sed -r 's,/[^/]*$,,')";
    sudo mkdir -p "$l";
    touch "$logs";
fi

# WWW symbolik link creation:
sudo rm /var/www/mesh
cd "$pwd";
sudo ln -s "$pwd/web" /var/www/mesh

# Printing user information to test the installation:
echo -e "\nMESH Media Server has been successfully installed!"
echo -e "Please open a compatible browser (Chrome, FF, ...) and go to the following URL:"
echo -e ">> http://localhost/mesh"
echo -e ""
