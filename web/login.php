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
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

// Parse configuration:
require_once '../app/config/initialize.php';

// Implement OpenID authentication:
require_once '../src/external/openid.php';

// Standard authentication process:
session_set_cookie_params(3600); // sessions last 1 hour
session_start();

$error = '';

// Implement the OpenId for the application:
if( false && isset($_GET['openid'])) {

    # Change 'localhost' to your domain name.
    $openid = new LightOpenID( $_SERVER['HTTP_HOST'] );

    // Open id not yet initialized:
    if(!$openid->mode) {

        if(isset($_GET['login'])) {
            $openid->identity = 'https://www.google.com/accounts/o8/id';
            $openid->required = array('contact/email');
            $openid->optional = array('namePerson', 'namePerson/friendly');
            header('Location: ' . $openid->authUrl());
        }
        
    }elseif($openid->mode == 'cancel') {
        $error = 'User has canceled authentication!';
    } else if ( $openid->validate() ) {
    
        $attributes = $openid->getAttributes();
    
        $_SESSION['openId'] = true;
        $_SESSION['timestamp'] = mktime()*1000;
        $_SESSION['login'] = $attributes['contact/email'];
        
        header('Location: index.php?openid');
    } else {
        echo 'User ' . ($openid->validate() ? $openid->identity . ' has ' : 'has not ') . 'logged in.';
    }
    
} else {

    if ( isset($_GET['logout']) ) {
        session_destroy();
        session_start();
    }

    if (false&&ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }

    // Authentication :
    if ( !array_key_exists('timestamp',$_SESSION) ) {
        if ( array_key_exists('timestamp',$_POST) ) {
            foreach ( $config['users'] as $login => $password ) {
                if ( hash( 'sha256' , $_POST['timestamp'] . '|' . $_POST['login'] . '|' . $_POST['password'] ) == hash( 'sha256' , $_POST['timestamp'] . '|' . $login . '|' . $password ) ) {
                    
                    $_SESSION['timestamp'] = $_POST['timestamp'];
                    $_SESSION['login'] = $login;
                    
                    header('Location: index.php');
                    
                    break;
                }
            }
            
            $error = 'Invalid password';
            
        } else {
            session_destroy();
        }
    }
    
}

?>
<!DOCTYPE html>
<html lang="en" manifest="_cache.manifest">
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
        
        <link rel="stylesheet" type="text/css" href="css/font-awesome.css">
        <link rel="stylesheet" type="text/css" href="css/stylesheet.css">
        
        <script type="text/javascript" src="external/js/base64.js"></script>
        <script type="text/javascript" src="external/js/sha256.js"></script>
        
        <script type="text/javascript" src="js/script.js"></script>
    </head>
    <body>
        <?php if ( empty($_SESSION['timestamp']) ): ?>
        <script type="text/javascript">
            $(document).ready(function(){
            
                // Remove all from localStorage:
                //if ( window.localStorage ) localStorage.clear();
                
                setTimeout(function(){
                    $('form').fadeIn().bind('submit',function(event){

                        //$m.config.reset();// Problem here.

                        $(this).fadeOut(400,function(){

                            // Timestamp generation :
                            var timestamp = (new Date()).getTime();

                            // Hash generation :
                            var hash = Sha256.hash( timestamp + '|' + $('*[name="login"]').val() + '|' + $('*[name="password"]').val() );
                            var share = Sha256.hash( 0 + '|' + $('*[name="login"]').val() + '|' + $('*[name="password"]').val() );
                            /*var hash = $m.api.utils.generateHash([
                                timestamp,
                                $('*[name="login"]').val(),
                                $('*[name="password"]').val()
                            ]);*/

                            //$(this).get(0).reset();
                            //$('*[name="hash"]').val( hash );
                            $('*[name="timestamp"]').val( timestamp );
                            
                            if ( $m.storage ) {
                                var servers = $m.storage.get('state.servers');
                                
                                //console.log( servers );
                                if ( servers && undefined !== servers['local'] ) {
                                    servers['local']['login'] = $('*[name="login"]').val();
                                    servers['local']['timestamp'] = timestamp;
                                    servers['local']['hash'] = hash;
                                    servers['local']['share'] = share;
                                    $m.storage.set('state.servers',servers);
                                }
                            }

                            $m.storage.set( 'hash' , hash );
                            $m.storage.set( 'share' , share );
                            $m.storage.set( 'timestamp' , timestamp );

                            $(this).get(0).submit();
                        });

                        event.preventDefault();
                        return false;
                    });
                },500);
            });
        </script>
        
        <div id="credentials" style="margin: 30% auto; margin-left: auto; text-align: center;">
            <form action="login.php" method="POST" style="display: none;">
                <input type="hidden" name="timestamp"/>
                <input type="text" name="login" placeholder="login" style="width: 100%; height: 2em; max-width: 25em; padding: 0.5em;"/><br/>
                <input type="password" name="password" placeholder="password" style="width: 100%; height: 2em; max-width: 25em; padding: 0.5em;"/><br/>
                <input type="submit" class="btn btn-primary" style="width: 100%; max-width: 25em; padding: 1em;"/><br/>
                <div class="text-error" style="text-align: center; padding-top: 1em;"><?php echo $error; ?></div>
            </form>
            
            <!--form action="?openid&login" method="post">
                <input type="image" src="http://www.google.com/favicon.ico"/>
            </form-->
        </div>
        
        <!--div style="position: absolute; bottom: 0.5em; width: 100%; text-align: center; max-height: 7em;">
            <img src="images/logo-d.png" style="height: 100%; max-width: 100%; height: auto; max-height: 100%;"/>
        </div-->
        <?php endif; ?>
    </body>
</html>
