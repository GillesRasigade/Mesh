<?php

require_once 'file.php';

class Api_Put_Card extends Api_Put_File {

    public function updateAction () {
        global $config;
        
        $p = Api_Utils::readToken();
        $status = false;
        
        if ( array_key_exists('path',$p) ) {
            
            $path = str_replace( '//' , '/' , $config['path'] . '/' . $p['path'] );
            
            if ( file_exists($path) ) {
                $card = $p;
                
                unset( $card['path'] );
                
                $card['updatedAt'] = gmdate('Y-m-d');
                
                $status = file_put_contents( $path , Api_Utils::outputJson( $card , FALSE ) );
            }
        }
        
        $status = $status ? 'success' : 'error' ;
        
        echo Api_Utils::outputJson(array(
            'status' => $status
        ));
        die();
    }

}
