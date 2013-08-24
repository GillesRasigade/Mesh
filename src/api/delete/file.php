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
