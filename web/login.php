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

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

session_destroy();
session_start();

// Authentication :
if ( !array_key_exists('timestamp',$_SESSION) ) {
    if ( array_key_exists('timestamp',$_POST) ) {
        foreach ( $config['users'] as $login => $password ) {
            if ( hash( 'sha256' , $_POST['timestamp'] . '|' . $_POST['login'] . '|' . $_POST['password'] ) == hash( 'sha256' , $_POST['timestamp'] . '|' . $login . '|' . $password ) ) {
                
                $_SESSION['timestamp'] = $_POST['timestamp'];
                $_SESSION['login'] = $login;
                
                break;
            }
        }
    }
}

?>
<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.0 Transitional//EN\">
<html lang="en">
    <head>
        <title>Media explorer</title>
        
        <link rel="icon" href="images/favicon.png" type="image/png"/>

        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta name="viewport" content='width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=0;' />
        
        <?php if ( !empty($_SESSION['timestamp']) ): ?>
        <meta http-equiv="refresh" content="0.5;url=index.php">
        <?php endif; ?>
        
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
    
        <!--script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
        <link href="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.0/css/bootstrap-combined.min.css" rel="stylesheet"/>
        <script src="//netdna.bootstrapcdn.com/twitter-bootstrap/2.3.0/js/bootstrap.js"></script-->
        
        <script src="external/js/jquery.min.js"></script>
        <link href="external/css/bootstrap-combined.min.css" rel="stylesheet"/>
        <script src="external/js/bootstrap.js"></script>
        
        <link rel="stylesheet" type="text/css" href="css/font-awesome.min.css">
        <link rel="stylesheet" type="text/css" href="css/stylesheet.css">
        
        <script type="text/javascript" src="external/js/sha256.js"></script>
        <script type="text/javascript" src="js/script.js"></script>
    </head>
    <body>
        <?php if ( empty($_SESSION['timestamp']) ): ?>
        <script type="text/javascript">
            $(document).ready(function(){
            
                setTimeout(function(){
                    $('form').fadeIn().bind('submit',function(event){

                        //$m.config.reset();// Problem here.

                        $(this).fadeOut(400,function(){

                            // Timestamp generation :
                            var timestamp = (new Date()).getTime();

                            // Hash generation :
                            var hash = Sha256.hash( timestamp + '|' + $('*[name="login"]').val() + '|' + $('*[name="password"]').val() );

                            //$(this).get(0).reset();
                            //$('*[name="hash"]').val( hash );
                            $('*[name="timestamp"]').val( timestamp );

                            $m.storage.set( 'hash' , hash );
                            $m.storage.set( 'timestamp' , timestamp );

                            $(this).get(0).submit();
                        });

                        event.preventDefault();
                        return false;
                    });
                },500);
            });
        </script>
        
        <div id="credentials" style="margin-top: 5em; margin-left: auto; text-align: center;">
            <form action="login.php" method="POST" style="display: none;">
                <input type="hidden" name="timestamp"/>
                <input type="text" name="login" placeholder="login" style="height: 2em;"/><br/>
                <input type="password" name="password" placeholder="password" style="height: 2em;"/><br/>
                <input type="submit" class="btn btn-primary"/>
            </form>
        </div>
        <?php endif; ?>
    </body>
</html>
