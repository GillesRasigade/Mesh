<?php

// Parse configuration :
include_once '../app/config/config.php';

// Retrieve Session ID :
$SID = session_id();

// User session creation
if( empty($SID) ) session_start();

$namespace = 'api';

// RESTfull API for communications :
// Default responses format is JSON.

// REST API initialization :
$method = $_SERVER['REQUEST_METHOD'];

if ( isset($_REQUEST['m']) ) $method = $_REQUEST['m'];

switch ( $method ) {
    case 'GET':
    case 'POST':
    case 'PUT':
    case 'DELETE':
        // Moving to the API folder :
        chdir('../src/api/');
        
        // Authentication :
        $auth = array();
        if ( array_key_exists( 'auth' , $_REQUEST ) ) {
            $auth = json_decode( base64_decode( $_REQUEST['auth'] ) , TRUE );
        } else {
            $headers = getallheaders();
            if ( array_key_exists( 'AuthenticationHash' , $headers ) && array_key_exists( 'Timestamp' , $headers ) ) {
                $auth = array(
                    'AuthenticationHash' => $headers['AuthenticationHash'],
                    'Timestamp' => $headers['Timestamp'],
                    'Timestamp2' => $headers['Timestamp2'],
                );
            }
        }
        
        if ( array_key_exists( 'AuthenticationHash' , $auth ) && array_key_exists( 'Timestamp' , $auth ) ) {
            $hash = $auth['AuthenticationHash'];
            $timestamp = $auth['Timestamp'];
            $isAuthenticated = FALSE;
            $isAnonymous = FALSE;
            
            $timestamp2 = NULL;
            if ( array_key_exists('timestamp',$_SESSION) ) {
                $timestamp2 = $_SESSION['timestamp'];
            
                error_log( 'timestamp = ' . $timestamp );
                error_log( 'timestamp2 = ' . $timestamp2 );
                error_log( 'hash = ' . $hash );
                foreach ( $config['users'] as $login => $password ) {
                    if ( $hash == hash( 'sha256' , $timestamp . hash( 'sha256' , $timestamp2 . '|' . $login . '|' . $password ) ) ) {
                        $isAuthenticated = TRUE;
                        if ( isset( $config[$login] ) ) $config['user'] = $config[$login];
                        break;
                    }
                }
            } else { // Anonymous connection - Not yet managed
                $timestamp2 = $auth['Timestamp2'];
            }
            
            if ( !$isAuthenticated ) {
                session_destroy();
                header('HTTP/1.0 403 Forbidden');
                die('Wrong credentials.');
            }
            
        } else {
            header('HTTP/1.0 403 Forbidden');
            die('Missing authentication keys.');
        }
        
        $m = strtolower($method);
        
        // Filter request based on the user permissions :
        if ( !in_array( $m , json_decode($config['user']['methods'])) ) {
            header('HTTP/1.0 403 Forbidden');
            die('Not authorized method.');
        }
        
        if ( is_dir( $m ) ) {
            
            // Reading the controller name :
            $c = strtolower( $_REQUEST['c'] );
            
            if ( empty($c) ) die('Controller name can not be empty');
            
            $lib = './' . $m . '/' . strtolower($c) . '.php';
            if ( file_exists($lib) ) {
                // Load utilities class object : static access.
                require_once 'utils.php';
            
                // Require the correct controller :
                require_once $lib;
                
                // Build of the class name :
                $className = ucfirst($namespace) . '_' . ucfirst($method) . '_' . ucfirst( $c );
                
                // Instantiation of the controller
                $controller = new $className();
                
                // Read the action to apply :
                $a = $_REQUEST['a'] . 'Action';
                
                if ( method_exists($controller,$a) ) {
                    // Call of the correct method to the requested controller :
                    $controller->$a();
                } else {
                    header('HTTP/1.0 400 Bad Request');
                    die('Action ' . $a . ' does not exist for controller ' . $c . '.');
                }
                
            } else {
                header('HTTP/1.0 400 Bad Request');
                die('Controller ' . $c . ' is not currently implemented for the method GET.');
            }
        
            include_once $lib;
        } else {
            header('HTTP/1.0 405 Method Not Allowed');
            die('Method ' . $method . ' is not currently implemented.');
        }
        break;
    default:
        header('HTTP/1.0 400 Bad Request');
        die('Unsupported API access method.');
        break;
}

die();
?>
