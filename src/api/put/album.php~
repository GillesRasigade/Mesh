<?php

require_once 'file.php';

class Api_Put_Album extends Api_Put_File {

    public function updateAction () {
        global $config;
        
        $p = Api_Utils::readToken();
        $status = false;
        
        if ( array_key_exists('path',$p) ) {
            
            $path = str_replace( '//' , '/' , $config['path'] . '/' . $p['path'] );
            
            if ( file_exists($path) ) {
                $album = $p;
                
                unset( $album['path'] );
                
                $album['header']['updatedAt'] = gmdate('Y-m-d');
                
                //var_dump( Api_Utils::outputJson( $album , FALSE ) );
                
                $status = file_put_contents( $path , Api_Utils::outputJson( $album , FALSE ) );
            }
        }
        
        $status = $status ? 'success' : 'error' ;
        
        echo Api_Utils::outputJson(array(
            'status' => $status
        ));
        die();
    }

}
