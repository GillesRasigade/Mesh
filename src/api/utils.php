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

class Api_Utils {

    // Levels labels based on the PHP syslog standard levels :
    public static $_logLevels = array(
        'EMERGENCY',    // LOG_EMERG
        'ALERT',        //LOG_ALERT
        'CRITICAL',     //LOG_CRIT
        'ERROR',        //LOG_ERR
        'WARNING',      //LOG_WARNING
        'NOTICE',       //LOG_NOTICE
        'INFO',         //LOG_INFO
        'DEBUG',        //LOG_DEBUG
    );

    const INCREMENT = 3;
    public static $_symbols = array(
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
    );

    public function __construct () {}
    
    
    public static function log ( $message , $level = 1 , $method = NULL ) {
        global $config;
        
        if ( $level <= $config['level'] ) {
            // Log line prefix :
            $log = array();
            $log[] = date('Y-m-d G:i:s',$_SERVER['REQUEST_TIME']);
            $log[] = '[' . self::$_logLevels[$level] . ']';
            $log[] = '[' . $method . ']';
            $log[] = $message;
        
            file_put_contents( $config['logs'] , implode( ' ', preg_replace( '/\n/', ' ', $log )) . "\n", FILE_APPEND );
        }
    }
    
    
    public static function outputJson ( $json = '' , $jsonp = TRUE ) {
        // Transform $json into correct json format :
        if ( !is_string( $json ) ) $json = json_encode( $json );
        
        // Output the JSONP compatible format :
        if ( $jsonp && array_key_exists('callback',$_REQUEST) ) {
            header('Content-Type: application/javascript');
            $json = $_REQUEST['callback']. '(' . $json . ')';
        } else {
            header('Content-Type: application/json');
        }
        return $json;
    }
    
    public static function createFolder ( $path ) {
        return self::exec( 'mkdir -p "' . $path . '";' );
    }
    
    // REF : http://stackoverflow.com/a/8688278
    public static function delayed__rmdir( $path ) { 
        echo $path; die();
        if ( is_dir( $path ) ) { 
            echo 'okokokok';
            $objects = scandir($path); 
            foreach ($objects as $object) { 
                if ($object != "." && $object != "..") { 
                    if (filetype($path."/".$object) == "dir"){
                         self::rmdir($path."/".$object);
                    } else {
                         unlink($path."/".$object);
                    } 
                } 
            }
            reset($objects); 
            return rmdir($path);
        }
    }
    
    // REF : http://stackoverflow.com/a/8688278
    public static function rmdir ( $path ) {
        return !empty($path) && is_file($path) ?
            @unlink($path) :
            (array_reduce(glob($path.'/*'), function ($r, $i) { return $r && self::rmdir($i); }, TRUE)) && @rmdir($path);
    }
    
    // REF : http://stackoverflow.com/a/8688278
    public static function buggy__rmdir ( $path ) {
        $class_func = array(__CLASS__, __FUNCTION__);
        return is_file($path) ?
                @unlink($path) :
                array_map($class_func, glob($path.'/*')) == @rmdir($path);
    }
    
    public static function shift ( $token , $direction = 1 ) {
        $t = array();
        foreach ( str_split( $token ) as $i => $char ) {
            $index = array_search( $char , self::$_symbols );
            if ( $index !== FALSE ) {
                $j = ( $index + $direction * self::INCREMENT );
                if ( $j < 0 ) $j += count( self::$_symbols );
                $t[$i] = self::$_symbols[ $j % count( self::$_symbols ) ];
            } else $t[$i] = $char;
        }
        return implode('',$t);
    }
    
    public static function getToken ( Array $data = array() ) {
        $token = json_encode( $data );
        
        $token = base64_encode ( $token );
        
        $token = self::shift( $token , 1*0 );
        
        return $token;
    }
    
    public static function readToken ( $token = NULL ) {
        // Parse the body request as well :
        if ( $_SERVER['REQUEST_METHOD'] == 'PUT' ) {
            parse_str( file_get_contents("php://input") , $body );
            $_REQUEST = array_merge( $_REQUEST , $body );
        }
    
        // Default reading token value if not given :
        if ( $token == NULL ) $token = $_REQUEST['token'];
        
        // Empty token given :
        if ( empty($token) ) return array();
        
        // Change obfuscation :
        // Change order of letters : right or left.
        $token = self::shift( $token , -1*0 );
        
        $result = json_decode( base64_decode( $token ) , TRUE );
        
        foreach ( $result as $key => $value ) {
            if ( is_string( $value ) ) {
                $result[$key] = urldecode( $value );
            }
        }
        
        return $result;
    }
    
    public static function exec ( $cmd = NULL ) {
        global $config;
        if ( $cmd == NULL ) return array();
        
        self::log( 'cmd = ' . $cmd , LOG_DEBUG , __METHOD__ );
        exec ( $cmd , $result );
        
        return $result;
    }
}
