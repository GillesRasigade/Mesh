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
 * http://www.apache.org/ licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

// Parse configuration :
include_once '../app/config/config.php';

session_start();

if ( empty($_SESSION['timestamp']) ) {
    header('Location: login.php');
}

?>
<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0 Transitional//EN\">
<html lang="en" manifest="__cache.manifest">
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
    
        <!--script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script-->
        <!--link href="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.0/css/bootstrap-combined.min.css" rel="stylesheet"/-->
        <!--script src="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.0/js/bootstrap.js"></script-->
        
        <script src="external/js/jquery.min.js"></script>
        <!--link href="external/css/bootstrap-combined.min.css" rel="stylesheet"/-->
        <script src="external/js/bootstrap.js"></script>
        
        <!--link rel="stylesheet" type="text/css" href="css/font-awesome.min.css"-->
        
        <!--link rel="stylesheet/less" type="text/css" href="css/less/sprites.less"-->
        <!--script src="//cloud.github.com/downloads/cloudhead/less.js/less-1.3.1.min.js" type="text/javascript"></script-->
        
        <link href="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.1/css/bootstrap-combined.no-icons.min.css" rel="stylesheet">
        <link href="//netdna.bootstrapcdn.com/font-awesome/3.1.1/css/font-awesome.css" rel="stylesheet">
            
        <link type="text/css" href="css/stylesheet.css" rel="stylesheet"/>
        <!--script type="text/javascript" src="js/jquery.base64.min.js"></script-->
        <script type="text/javascript" src="external/js/base64.js"></script>
        <script type="text/javascript" src="external/js/sha256.js"></script>
        
        <!--script type="text/javascript" src="external/js/jquery.event.move.js"></script>
        <script type="text/javascript" src="external/js/jquery.event.swipe.js"></script-->
        
        <script type="text/javascript" src="js/script.js"></script>
        
        <script type="text/javascript">
            window.$m = $.extend( true , window.$m !== undefined ? window.$m : {} , {
                state: {
                    typesOrder: [ 'folder' , 'music' , 'card' , 'video' , 'pdf' ],
                    server: 'local',
                    servers: {
                        'local': {
                            name: 'local',
                            url: '<?php echo $config['servers']['local']; ?>',
                            login: '<?php echo $_SESSION['login']; ?>',
                            timestamp: '<?php echo $_SESSION['timestamp']; ?>',
                            hash: '<?php echo hash( 'sha256' , $_SESSION['timestamp'] . '|' . $_SESSION['login'] . '|' . $config['users'][$_SESSION['login']] ); ?>',
                        }
                    }
                },
            });
        </script>
        
    </head>
    <body>
        
        <div id="splash-screen" style="display: none;">
            <div class="icon-remove close" style="color: white; text-shadow: 0px 0px 5px black; padding: 0.25em; margin-left: -100%; font-size: 3em;z-index: 1001; position: relative;">&nbsp;</div>
            <table style="">
                <tbody>
                    <tr>
                        <td class="content"></td>
                    </tr>
                </tbody>
            </table>
            
            <div class="btn-prev prev"><i class="icon-arrow-left">&nbsp;</i></div>
            <div class="btn-next next"><i class="icon-arrow-right">&nbsp;</i></div>
            <div class="icon-spin icon-spinner" style="display: none; color: white;padding: 0.25em;font-size: 3em;opacity: 0.5;position: absolute;bottom: 0px;right: 0px;">&nbsp;</div>
            <div class="controls"style="position: fixed; bottom: 0px; width: 20%; left: 40%; overflow: visible; font-size: 3em; padding: 0.25em; text-align: center;">
                <div class="btn-group">
                    <div class="btn btn-link prev"><i style="font-size: 3em;" class="icon-step-backward">&nbsp;</i></div>
                    <div class="btn btn-link play"><i style="font-size: 3em;" class="icon-play">&nbsp;</i></div>
                    <div class="btn btn-link next"><i style="font-size: 3em;" class="icon-step-forward">&nbsp;</i></div>
                </div>
            </div>
        </div>
        
        <!--div class=""  style="position: absolute;left: 0px;right: 0px;top: 0px;bottom: 0px; z-index: 0;"-->
            <div class="tab-content">
                <div id="explorer" class="tab-pane row-fluid active"></div>
            </div>
        <!--/div-->
        
        <div id="top">
            
            <div id="navigation-panel" class="tab-pane row-fluid">
                <div id="filter-panel">
                    <form id="form-filter" class="form-search">
                        <div class="input-inline">
                            <button class="btn btn-link" style="float: left; color: #888; margin-top: 0.35em;margin-right: -100%;margin-left: -0.5em;"><i class="icon-spinner icon-spin icon-large" style="inline-block;">&nbsp;</i></button>
                            <input type="search" id="s" name="s" value="" placeholder="Search" class="search-query" style="padding-left: 2em;" />
                        </div>
                    </form>
                </div>
                
                <div id="menu-dropdown" style="float: left; margin-top: 0.6em; margin-left: -1.65em;" class="dropdown">
                    <a class="btn btn-link dropdown-toggle" data-toggle="dropdown" href="#">
                        <i class="icon-reorder" style="width: 8px;overflow: hidden;display: inline-block;"></i>
                        <img src="images/favicon-128.png" style="width: 2em;margin-top: -0.5em;margin-left: -0.2em;"/>
                    </a>
                    
                    <ul class="dropdown-menu lateral-left">

                        <li class="divider last"></li>

                        <li><a href="login.php?logout"><i class=" icon-signout"></i> logout (<?php echo $_SESSION['login'] ?>)</a></li>
                        
                        <li class="divider"></li>
                        
                        <li><a href="javascript:void(0);">
                            <div class="btn-group" style="width: 100%; text-align: center;">
                                <span class="btn" onClick="$m.storage.set( 'state.scale' , $m.state.scale * 0.75 ); $m.explorer.resize(); return false;">&nbsp;-&nbsp;</span>
                                <span class="btn" onClick="$m.storage.set( 'state.scale' , $m.state.scale / 0.75 ); $m.explorer.resize(); return false;">&nbsp;+&nbsp;</span>
                            </div>
                        </a></li>
                        
                        <li class="divider"></li>
                        
                        <li class="application-details"><a href="https://github.com/billou-fr/media-manager" target="_blank">Fork us on Github!</a></li>
                        <li class="application-details"><a href="https://github.com/billou-fr/media-manager/commits/" target="_blank" title="Build: <?php echo $git; ?>" class="git-sha" ><?php echo $git; ?></a></li>
                    </ul>
                </div>
                
                <div id="servers-dropdown" style="float: left; margin-top: 0.4em;" class="dropdown">
                    <a class="btn btn-link dropdown-toggle" data-toggle="dropdown" href="#">
                        <i class="icon-sitemap"></i>
                    </a>
                    
                    <ul class="dropdown-menu  lateral-left">
                        <li>
                            <a href="javascript:$m.addServer();">
                                Add new
                            </a>
                        </li>
                        
                        <li class="divider"></li>
                    
                        <?php if ( FALSE ): ?>
                        <?php foreach ( $config['servers'] as $server => $url ): ?>
                        <li class="server">
                            <a data-url="<?php echo $url; ?>" title="Explore files on <?php echo $server; ?>" href="javascript:void(0);">
                                <img class="img-circle" src="<?php echo preg_replace('/\/[^\/]+$/' , '/images/server-icon.png', $url); ?>" />
                                <span title="Go to this server" onClick="window.location = '<?php echo preg_replace('/\/[^\/]+$/' , '/index.php', $url); ?>';" target="_top"><?php echo $server; ?></span>
                                <span class="btn btn-link"><i class="icon-remove"></i></span>
                            </a>
                        </li>
                        <?php endforeach; ?>
                        <?php endif; ?>
                        
                        
                    </ul>
                </div>
                
                
                <div class="mini-scroll" style="max-width: 65%; float: left; overflow-x: scroll;">
                    <ul id="explorer-tree-nav" class="breadcrumb" style="overflow: hidden; white-space: nowrap;"></ul>
                </div>
            </div>
        </div>
        
        <div id="application-details"></div>
    </body>
</html>
