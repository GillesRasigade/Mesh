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

require_once 'file.php';

class Api_Post_Card extends Api_Post_File {

    public function createAction () {
        global $config;
        
        $p = Api_Utils::readToken();
        $status = false;
        
        if ( array_key_exists('path',$p) ) {
            
            $path = str_replace( '//' , '/' , $config['path'] . '/' . $p['path'] );
            chdir( $path );
            
            // Building the file name :
            $index = Api_Utils::exec( 'ls *.card.json | sort -g | tail -n 1' );
            if ( preg_match( '/.*.card.json/' , $index[0]  ) ) {
                $index = intval( preg_replace( '/^(\d+)-.*/' , '$1' , $index[0] ) );
                
            } else $index = -1;
            
            $name = ($index+1) ;
            if ( isset($p['title']) && $p['title'] != '' ) {
                $title = substr( preg_replace( '/ /' , '-' , strtolower( trim( $p['title'] ) ) ) , 0 , 50 );
                $name .= '-' . $title ;
            }
            $name .= '.card.json';
            
            if ( !file_exists($name) ) {
                $card = $p;
                
                unset( $card['path'] );
                
                $card['createdAt'] = $card['updatedAt'] = gmdate('Y-m-d');
                
                $status = file_put_contents( $name , Api_Utils::outputJson( $card , FALSE ) );
            }
        }
        
        $status = $status ? 'success' : 'error' ;
        
        echo Api_Utils::outputJson(array(
            'status' => $status
        ));
        die();
    }

}
