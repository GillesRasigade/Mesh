#!/bin/bash

echo -e "Mesh installer\n";

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
    sudo /etc/init.d/apache2 restart
else
    echo "php correctly installed"
fi


