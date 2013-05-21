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

class Api_Get_Log {
    
    public function __contruct () {
        
    }
    
    public static function search ( $p = array() , $options = array() ) {
        global $config;
    
        $path = '/';
        if ( array_key_exists('path',$p) ) $path = $p['path'] . $path;

        // Building the absolute requested path :
        $path = $config['path'] . $path;
        
        // Executing local file system command :
        $offset = 0; $limit = 10;
        if ( array_key_exists('offset',$p) ) $offset = intval( $p['offset'] );
        if ( array_key_exists('limit',$p) ) $limit = intval( $p['limit'] );
        
        // For debug only :
        if ( array_key_exists('search',$_REQUEST) ) $p['search'] = $_REQUEST['search'];
        
        if ( array_key_exists('search',$p) ) {
            $search = $p['search'];
            
            if ( !preg_match('/^\^/',$search) ) $search = ' ' . $search;
            if ( !preg_match('/\$$/',$search) ) $search = $search . ' ';
            
            $search = preg_replace('/(\.|\(|\)|\[|\])/',"\\\\$1",$search);
            
            $search = preg_replace('/ /','.*', $search);
        
            $cmd = 'grep -i -e "'. $search .'" "'. $config['log'] .'"';
            
        } else {
            $cmd = 'cat "'. $config['log'] .'"';
        }
        
        if ( array_key_exists('sort',$options) ) {
            switch ( $options['sort'] ) {
                case 'reverse':
                    $cmd .= ' | sort -r';
                    break;
            }
        }
        
        // Return the line index only :
        if ( array_key_exists( 'indexOf' , $options ) ) {
            $index = Api_Utils::exec( $cmd . ' | grep -n "' . $options['indexOf'] . '"' );
            $index = intval( $index[0] );
            return $index;
        }
        
        // Counting the number of results :
        $count = Api_Utils::exec( $cmd . ' | wc -l' );
        $count = intval( $count[0] );
        
        $results = array();
        if ( $offset < $count ) {
            // Building the system command :
            $cmd .= '| head -n ' . ( $offset + $limit ) . ' | tac | head -n ' . $limit . ' | tac';
            
            $r = Api_Utils::exec( $cmd );
            
            $results = array();
            for ( $i = min( count($r) , $limit ) ; $i > max( 0 , min( count($r) , $limit ) - ( $count - $offset ) ) ; $i-- ) {
                //var_dump($i-1); echo '<br/>';
                $results[] = $r[$i-1];
            }
            $results = array_reverse($results);
        }
        
        $r = $results;
        
        return $r;
    }
    
    public function searchAction () {
        global $config;
        
        $p = Api_Utils::readToken();
        
        $r = Api_Get_File::search( $p );

        echo Api_Utils::outputJson( $r );
        die();
    }
    
    /**
     * List all the folders and files present in a specific folder.
     */
    public function listAction () { return $this->searchAction(); }
}
