<?php

/* ===================================================
 * Media Manager v0.1
 * https://github.com/billou-fr/Mesh/
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
include_once '../app/config/initialize.php';

// Implement OpenID authentication:
require_once '../src/external/openid.php';

session_set_cookie_params(3600); // sessions last 1 hour
session_start();

// Shared link access:
if ( isset($_GET['link']) ) {
    require_once '../src/api/utils.php';
    $token = Api_Utils::readToken( $_GET['link'] );
    if ( isset($token['shared']) && $token['shared'] ) {
        $_SESSION['anonymous'] = true;
        $_SESSION['timestamp'] = mktime()*10000;
        $_SESSION['user'] = array(
            'login' => 'Anonymous',
            'methods' => array( 'get' ),
            'path' => $token['path']
        );
    }
    
    //var_dump( $token , $_SESSION ); die();
}

// Implement the OpenId for the application:
if( isset($_GET['openid'])) {
    
    # Change 'localhost' to your domain name.
    $openid = new LightOpenID( $_SERVER['HTTP_HOST'] );
    
    $logged = false;
    if ( isset($_SESSION['login']) ) {
        $login = $_SESSION['login'];
        
        if ( array_key_exists($login,$config['users']) ) {
            if ( in_array( $login , $config['openid'] ) ) {
                $logged = true;
            }
        }
    }
    
    if ( !$logged ) header('Location: login.php');
}

if ( empty($_SESSION['timestamp']) || mktime() - round(floatval($_SESSION['timestamp'])/1000) >= 3600 ) {
    header('Location: login.php');
}

?>
<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0 Transitional//EN\">
<html lang="en" manifest="cache.manifest">
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
        
        <link href="external/css/bootstrap-combined.no-icons.min.css" rel="stylesheet">
        <link href="external/css/font-awesome.css" rel="stylesheet">
            
        <link type="text/css" href="css/stylesheet.css" rel="stylesheet"/>
        
        <meta property="og:title" content="Mesh" />
        <meta property="og:name" content="Mesh" />
        <meta property="og:image" content="images/favicon.png" />
        <meta property="og:description" content="Media Server for Humans" />
        
    </head>
    <body>
        
        <div id="splash-screen" style="display: none;">
            <div class="icon-remove close" style="color: white; text-shadow: 0px 0px 5px black; padding: 0.25em; margin-left: -100%; font-size: 3em; z-index: 1001; position: relative; right: 0.5em;">&nbsp;</div>
            <table style="">
                <tbody>
                    <tr>
                        <td class="content"></td>
                    </tr>
                </tbody>
            </table>
            
            <div class="btn-prev prev"><i class="icon-arrow-left">&nbsp;</i></div>
            <div class="btn-next next" style="margin-right: 0.5em;"><i class="icon-arrow-right">&nbsp;</i></div>
            <div class="icon-spin icon-spinner" style="display: none; color: white;padding: 0.25em;font-size: 3em;opacity: 0.5;position: absolute;bottom: 0px;right: 0px;">&nbsp;</div>
            <div class="controls"style="position: fixed; bottom: 0px; width: 20%; left: 40%; overflow: visible; font-size: 3em; padding: 0.25em; text-align: center;">
                <div class="btn-group">
                    <div class="btn btn-link prev"><i style="font-size: 3em;" class="icon-step-backward">&nbsp;</i></div>
                    <div class="btn btn-link play"><i style="font-size: 3em;" class="icon-play">&nbsp;</i></div>
                    <div class="btn btn-link next"><i style="font-size: 3em;" class="icon-step-forward">&nbsp;</i></div>
                </div>
            </div>
        </div>
        
        <div class="tab-content">
            <div id="explorer" class="tab-pane row-fluid active"></div>
        </div>
        
        <div id="top">
            
            <div id="navigation-panel" class="tab-pane row-fluid">
                <div id="filter-panel">
                    <div id="form-filter" class="form-search">
                        <div class="input-inline">
                            <button class="btn btn-link" style="float: left; color: #888; margin-top: 0.35em;margin-right: -100%;margin-left: -0.5em;"><i class="icon-spinner icon-spin icon-large" style="inline-block;">&nbsp;</i></button>
                            <input type="search" id="s" name="s" value="" placeholder="Search" class="search-query" style="padding-left: 2em;" />
                        </div>
                    </div>
                </div>
                
                <div id="menu-dropdown" style="float: left; margin-top: 0.6em; margin-left: -1.65em;" class="dropdown">
                    <a class="btn btn-link dropdown-toggle" data-toggle="dropdown" href="#">
                        <i class="icon-reorder" style="width: 8px;overflow: hidden;display: inline-block; position: relative; top: -0.25em;"></i>
                        <img src="images/favicon-128.png" style="width: 1.75em;margin-top: -0.5em;margin-left: -0.2em;"/>
                    </a>
                    
                    <ul class="dropdown-menu lateral-left">

                        <li class="divider last"></li>

                        <li><a href="javascript:void(0);" id="view-recents"><i class="icon-time"></i> Recents</a></li>
                        <li><a href="login.php?logout"><i class="icon-signout"></i> logout &nbsp; <i class="icon-user"></i></a></li>
                        
                        <li class="divider"></li>
                        
                        <li class="no-hover"><a href="javascript:void(0);">
                            <div class="btn-group" style="width: 100%; text-align: center;">
                                <span class="btn" onClick="$m.storage.set( 'state.scale' , $m.state.scale * 0.75 ); $m.explorer.resize(); return false;">&nbsp;-&nbsp;</span>
                                <span class="btn" onClick="$m.storage.set( 'state.scale' , $m.state.scale / 0.75 ); $m.explorer.resize(); return false;">&nbsp;+&nbsp;</span>
                            </div>
                        </a></li>
                        
                        <li class="divider a"></li>
                        
                        <!--li class="application-details"><a href="https://plus.google.com/b/108102348820509719254/108102348820509719254/posts" target="_blank" style="text-align: center;"><img src="images/logo.png" style="height: 3em; margin: 1em auto;"/></a></li-->
                        <li class="application-details" style="margin-top: -0.8em;">
                            <div class="g-page" data-layout="portrait" data-width="240" data-href="https://plus.google.com/b/108102348820509719254/108102348820509719254/posts"></div>
                        </li>
                        <li class="application-details" style="text-align: center;"><a href="https://github.com/billou-fr/Mesh" target="_blank">Fork us on Github!</a></li>
                        <li class="application-details" style="text-align: center;"><a href="https://github.com/billou-fr/Mesh/issues/new" target="_blank">Found a bug ?</a></li>
                        <li class="application-details" style="text-align: center;"><a href="https://github.com/billou-fr/Mesh/commits/" target="_blank" title="<?php echo $git; ?>" class="git-sha" ><?php echo substr($git,0,10); ?></a></li>
                    </ul>
                </div>
                
                <div id="servers-dropdown" style="float: left; margin-top: 0.4em;" class="dropdown">
                    <a class="btn btn-link dropdown-toggle" data-toggle="dropdown" href="#" style="max-width: 2.5em;
overflow: hidden;
position: relative;
top: -0.55em;
margin-right: -1em;">
                        <img class="img-circle" src="images/favicon-256.png" style="height: 2.5em; width: 2.5em;">
                    </a>
                    
                    <ul class="dropdown-menu  lateral-left">
                        <li>
                            <a href="javascript:$m.editServer();">
                                Add new
                            </a>
                        </li>
                        
                        <li class="divider"></li>
                        
                    </ul>
                </div>
                
                
                <div class="mini-scroll" style="max-width: 65%; float: left; overflow-x: auto; overflow-y: hidden; height: 100%;">
                    <ul id="explorer-tree-nav" class="breadcrumb" style="overflow: hidden; white-space: nowrap;height: 100%;"></ul>
                </div>
            </div>
        </div>
        
        <div id="application-details"></div>
        
        
        
        <div id="sharePost"></div>
<script type="text/javascript">
  var options = {
    contenturl: 'https://plus.google.com/pages/',
    contentdeeplinkid: '/pages',
    clientid: '590506346694-tgcq5emh1lcvnsnt5qa8piqao9akb8af.apps.googleusercontent.com',
    cookiepolicy: 'single_host_origin',
    prefilltext: 'Create your Google+ Page too!',
    calltoactionlabel: 'CREATE',
    calltoactionurl: 'http://plus.google.com/pages/create',
    calltoactiondeeplinkid: '/pages/create'
  };
  // Call the render method when appropriate within your app to display
  // the button.
  gapi.interactivepost.render('sharePost', options);
</script>
        
        
        
        
        
        
        
        
        
        
        
        
        
        <script src="external/js/jquery.min.js"></script>
        <script src="external/js/bootstrap.js"></script>
        <script type="text/javascript" src="external/js/base64.js"></script>
        <script type="text/javascript" src="external/js/sha256.js"></script>
        
        <?php if( isset($_GET['openid'])): ?>
        <script type="text/javascript">
            var openId = {
                login: '<?php echo $_SESSION['login']; ?>',
                timestamp: '<?php echo $_SESSION['timestamp']; ?>',
                i: '<?php echo $config['users'][$_SESSION['login']]; ?>',
            };
        </script>
        <?php endif; ?>
        
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
                            share: '<?php echo hash( 'sha256' , 0 . '|' . $_SESSION['login'] . '|' . $config['users'][$_SESSION['login']] ); ?>',
                        }
                    }
                },
            });
        </script>
        
        
        
    </body>
</html>
