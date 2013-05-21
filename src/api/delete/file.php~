<?php

class Api_Delete_File {

    public function deleteAction () {
        global $config;
        
        $p = Api_Utils::readToken();
        $status = false;
        
        if ( array_key_exists('path',$p) ) {
            
            $path = str_replace( '//' , '/' , $config['path'] . '/' . $p['path'] );
            
            if ( is_dir($path) ) {
                $status = Api_Utils::rmdir( $path );
            } else if ( file_exists( $path ) ) {
                $status = unlink( $path );
                
                $data = preg_replace( '/\/[^\/]+$/' , '' , str_replace( '//' , '/' , $config['data'] . '/' . $p['path'] ));
                $file = preg_replace('/.*\//','',$path);
                
                // Remove all possible existing associated files :
		        $result = Api_Utils::exec( 'cd "' . $data . '"; rm *-' . $file . '*;' );
            }
        
        }
        
        $status = $status ? 'success' : 'error' ;
        
        echo Api_Utils::outputJson(array(
            'status' => $status
        ));
        die();
    }

}
