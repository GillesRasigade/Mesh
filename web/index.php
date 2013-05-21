<?php

/* ===================================================
 * Media Manager v0.1
 * https://github.com/billou-fr/media-manager/
 * ===================================================
 * Copyright 2013 Gilles Rasigade
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

// Parse configuration :
include_once '../app/config/config.php';

// Retrieve Session ID :
$SID = session_id();

// User session creation
if( empty($SID) ) session_start();

if ( empty($_SESSION['timestamp']) ) {
    header('Location: login.php');
}

?>
<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0 Transitional//EN\">
<html lang="en">
    <head>
        <title>Media explorer</title>
        
        <link rel="icon" href="images/favicon.png" type="image/png"/>

        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;" />
        
        <link rel="icon" href="images/favicon-32.png" sizes="32x32" type="image/png">
        <link rel="icon" href="images/favicon-64.png" sizes="64x64" type="image/png">
        <link rel="icon" href="images/favicon-128.png" sizes="128x128" type="image/png">
        <link rel="icon" href="images/favicon.png" sizes="256x256" type="image/png">
        
        <link rel="apple-touch-icon-precomposed" href="images/icon-iphone.png" />
        <link rel="apple-touch-startup-image" href="images/icon-iphone.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Media">
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <link rel="apple-touch-startup-image" href="images/default-album.gif" />
    
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
        <!--link href="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.0/css/bootstrap-combined.min.css" rel="stylesheet"/-->
        <script src="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.0/js/bootstrap.js"></script>
        
        <!--script src="external/js/jquery.min.js"></script-->
        <!--link href="external/css/bootstrap-combined.min.css" rel="stylesheet"/-->
        <!--script src="external/js/bootstrap.js"></script-->
        
        <!--link rel="stylesheet" type="text/css" href="css/font-awesome.min.css"-->
        
        <!--link rel="stylesheet/less" type="text/css" href="css/less/sprites.less"-->
        <!--script src="//cloud.github.com/downloads/cloudhead/less.js/less-1.3.1.min.js" type="text/javascript"></script-->
        
        <link href="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.1/css/bootstrap-combined.no-icons.min.css" rel="stylesheet">
        <link href="//netdna.bootstrapcdn.com/font-awesome/3.1.1/css/font-awesome.css" rel="stylesheet">
            
        <link type="text/css" href="css/stylesheet.css" rel="stylesheet"/>
        <!--script type="text/javascript" src="js/jquery.base64.min.js"></script-->
        <script type="text/javascript" src="external/js/base64.js"></script>
        <script type="text/javascript" src="external/js/sha256.js"></script>
        
        <script type="text/javascript" src="js/script.js"></script>
        
        <script type="text/javascript">
            window.media = $.extend( window.media !== undefined ? window.media : {} , {
                init: {
                    servers: {<?php foreach ( $config['servers'] as $name => $url ) echo "\n'" . $name . "': '" . $url . "',"; ?>
                    }
                }
            });
        </script>
        
    </head>
    <body>
        
        
        
        <!--div class=""  style="position: absolute;left: 0px;right: 0px;top: 0px;bottom: 0px; z-index: 0;"-->
            <div class="tab-content">
                <div id="explorer" class="tab-pane row-fluid active"></div>
            </div>
        <!--/div-->
        
        <div id="top">
            
            <div id="navigation-panel" class="tab-pane row-fluid">
                <div id="filter-panel">
                    <form id="form-filter" class="form-search">
                        <div class="input-append">
                          <input type="search" id="s" name="s" value="" placeholder="Search" class="search-query tablet" />
                          <button type="submit" class="btn tablet"><i class="icon-search"></i>&nbsp;</button>
                        </div>
                    </form>
                </div>
                
                <div id="menu-dropdown" style="float: left; margin-top: 0.6em;" class="dropdown">
                    <a class="btn btn-link dropdown-toggle" data-toggle="dropdown" href="#">
                        <i class="icon-file"></i>
                    </a>
                    
                    <ul class="dropdown-menu">

                        <li class="divider last"></li>

                        <li><a href="login.php"><i class=" icon-signout"></i> logout (<?php echo $_SESSION['login'] ?>)</a></li>
                    </ul>
                </div>
                
                
                <div class="mini-scroll" style="max-width: 65%; float: left; overflow-x: scroll;">
                    <ul id="explorer-tree-nav" class="breadcrumb" style="overflow: hidden; white-space: nowrap;"></ul>
                </div>
            </div>
        </div>
    </body>
</html>
