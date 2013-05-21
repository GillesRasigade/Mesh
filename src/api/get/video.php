<?php

require_once 'file.php';

class Api_Get_Video extends Api_Get_File {

    public static function _createThumb ( $p ) {
        global $config;
        
        $original = str_replace( '//' , '/' , $config['path'] . '/' . $p['path'] );
        
        $path = str_replace( '//' , '/' , $config['data'] . '/' . $p['thumb'] );
    
        $folder = preg_replace( '/\/[^\/]+$/' , '' , $path );
        
        // Building the data folder :
        if ( !is_dir( $folder ) ) {
            Api_Utils::createFolder( $folder );
        }
        
        $result = Api_Utils::exec('ffmpeg -i "'.$original.'" -an -ss 00:00:00 -an -r 1 -vframes 1 -y "'.$path.'"');
    }
    
    public function accessAction ( $p = NULL ) {
        global $config;
    
        $p = Api_Utils::readToken();
        
        if ( array_key_exists('path',$p) ) {
            $path = $config['path'] . $p['path'];
            
            if ( file_exists( $path ) ) {
                
                
                if ( array_key_exists('mode',$p) && array_key_exists($p['mode'],$config['pdf']) ) {
                
                    $p['thumb'] = preg_replace( '/([^\/]+)$/' , $config['image'][$p['mode']].'-$1.jpg' , $p['path'] );
                    $path = $config['data'] . $p['thumb'];
                    
                    error_log( $path );
                    error_log( $config['data'] . $p['thumb'] );
                    error_log( var_export( $p , TRUE ));
                    
                    if ( !file_exists( $config['data'] . $p['thumb'] ) ) {
                        $this->_createThumb($p);
                    }
                }
                
                switch ( true ) {
                    case preg_match('/jpe?g/i',$path):
                        header("Content-type: image/jpeg");
                        break;
                    default:
                        header('Content-type: audio/mpeg');
                        header('Content-Length: '.filesize($path)); // provide file size
                        header("Expires: -1");
                        header("Cache-Control: no-store, no-cache, must-revalidate");
                        header("Cache-Control: post-check=0, pre-check=0", false);
                        break;
                }
                
                //header("Content-Disposition: inline; filename=\"" . preg_replace('/.*([^\/]+)$/','$1',$path) . "\"");
                
                readfile( $path );
                exit;
            
            } else {
                die('File does not exists.');
            }
        }
        
        die();
    }
}
