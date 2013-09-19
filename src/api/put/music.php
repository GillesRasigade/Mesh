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

class Api_Put_Music extends Api_Put_File {

    public static function genres () {
        
	    $genres = array();
	    
	    exec( 'mp3info -G' , $out );
	    for ( $i = 2 ; $i < count($out) ; $i++ ) {
	        preg_match_all('/(\d+ [^\d]+)/',$out[$i],$match);
	        foreach ( $match[0] as $genre ) {
	            $id = intval(preg_replace('/ [^\d]+$/','',$genre));
	            $name = preg_replace('/^\d+ /','',$genre);
	            $genres[$id] = $name;
	        }
	    }
 	    
	    return $genres;
    }

    public static function mp3info ( $folder , $file , $infos = array() ) {
    
        $cmd = "mp3info -p \"%t\n%m:%02s\n%a\n%l\n%n\n%y\n%G\n\" \"".$folder.'/'.$file."\"";
		exec( $cmd , $result );
        
        error_log( var_export( $result , TRUE) );
        
        $keys = array('title','duration','artist','album','track','year','genre' );
        
        //$infos = $result + $infos;
        foreach ( $keys as $i => $key ) {
            if ( !isset($infos[$key]) )
                $infos[$key] = $result[$i];
        }
        
        $genres = self::genres();
        $genreId = array_search( $infos['genre'] , $genres );
        $infos['genre'] = $genreId !== FALSE ? $genreId : 0;
        
        $cmd = "mp3info -f -t \"".$infos['title']."\" -a \"".$infos['artist']."\" -l \"".$infos['album']."\" -n \"".$infos['track']."\" -y \"".$infos['year']."\" -g \"".$infos['genre']."\" \"".$folder.'/'.$file."\"";
        exec( $cmd , $result );
        
        $cmd = "cd \"".$folder."/\"; mp3info -f -a \"".$infos['artist']."\" -l \"".$infos['album']."\" -y \"".$infos['year']."\" -g \"".$infos['genre']."\" ./*";
        exec( $cmd , $result );
        
        error_log( var_export( $result , TRUE ) );
        return $infos;
    }
    
    public function infosAction () {
    
        
    
        global $config;
        
        $p = Api_Utils::readToken();
        
        // Read data for music files only :
        $filename = preg_replace('/^.*\/([^\/]+$)/','$1',$p['path']);
        
        //echo Api_Utils::outputJson( array( $path , $filename ) ); die();
        
        $infos = self::mp3info( $config['path'] . '/' . preg_replace('/\/[^\/]+$/','',$p['path']) , $filename , $p );
        
        echo Api_Utils::outputJson( $infos );
        die();
    }
    
}
