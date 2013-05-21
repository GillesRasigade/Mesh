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

class Api_Get_File {

    // REF : http://www.techstruggles.com/mp3-streaming-for-apple-iphone-with-php-readfile-file_get_contents-fail/
    protected function _rangeDownload( $file ) {

	    $fp = @fopen($file, 'rb');

	    $size   = filesize($file); // File size
	    $length = $size;           // Content length
	    $start  = 0;               // Start byte
	    $end    = $size - 1;       // End byte
	    // Now that we've gotten so far without errors we send the accept range header
	    /* At the moment we only support single ranges.
	     * Multiple ranges requires some more work to ensure it works correctly
	     * and comply with the spesifications: http://www.w3.org/Protocols/rfc2616/rfc2616-sec19.html#sec19.2
	     *
	     * Multirange support annouces itself with:
	     * header('Accept-Ranges: bytes');
	     *
	     * Multirange content must be sent with multipart/byteranges mediatype,
	     * (mediatype = mimetype)
	     * as well as a boundry header to indicate the various chunks of data.
	     */
	     
	     error_log( 'range download...' );
	     
	    header("Accept-Ranges: 0-$length");
	    // header('Accept-Ranges: bytes');
	    // multipart/byteranges
	    // http://www.w3.org/Protocols/rfc2616/rfc2616-sec19.html#sec19.2
	    if (isset($_SERVER['HTTP_RANGE'])) {

		    $c_start = $start;
		    $c_end   = $end;
		    // Extract the range string
		    list(, $range) = explode('=', $_SERVER['HTTP_RANGE'], 2);
		    // Make sure the client hasn't sent us a multibyte range
		    if (strpos($range, ',') !== false) {

			    // (?) Shoud this be issued here, or should the first
			    // range be used? Or should the header be ignored and
			    // we output the whole content?
			    header('HTTP/1.1 416 Requested Range Not Satisfiable');
			    header("Content-Range: bytes $start-$end/$size");
			    // (?) Echo some info to the client?
			    exit;
		    }
		    // If the range starts with an '-' we start from the beginning
		    // If not, we forward the file pointer
		    // And make sure to get the end byte if spesified
		    if ($range[0] == '-') {

			    // The n-number of the last bytes is requested
			    $c_start = $size - substr($range, 1);
		    }
		    else {

			    $range  = explode('-', $range);
			    $c_start = $range[0];
			    $c_end   = (isset($range[1]) && is_numeric($range[1])) ? $range[1] : $size;
		    }
		    /* Check the range and make sure it's treated according to the specs.
		     * http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html
		     */
		    // End bytes can not be larger than $end.
		    $c_end = ($c_end > $end) ? $end : $c_end;
		    // Validate the requested range and return an error if it's not correct.
		    if ($c_start > $c_end || $c_start > $size - 1 || $c_end >= $size) {

			    header('HTTP/1.1 416 Requested Range Not Satisfiable');
			    header("Content-Range: bytes $start-$end/$size");
			    // (?) Echo some info to the client?
			    exit;
		    }
		    $start  = $c_start;
		    $end    = $c_end;
		    $length = $end - $start + 1; // Calculate new content length
		    fseek($fp, $start);
		    header('HTTP/1.1 206 Partial Content');
	    }
	    // Notify the client the byte range we'll be outputting
	    header("Content-Range: bytes $start-$end/$size");
	    header("Content-Length: $length");

	    // Start buffered download
	    $buffer = 1024 * 8;
	    while(!feof($fp) && ($p = ftell($fp)) <= $end) {

		    if ($p + $buffer > $end) {

			    // In case we're only outputtin a chunk, make sure we don't
			    // read past the length
			    $buffer = $end - $p + 1;
		    }
		    set_time_limit(0); // Reset time limit for big files
		    echo fread($fp, $buffer);
		    flush(); // Free up memory. Otherwise large files will trigger PHP's memory limit.
	    }

	    fclose($fp);

    }
    
    public function __contruct () {
        
    }
    
    public static function getType ( $path , $file ) {
        global $config;
        
        $types = $config['types'];
        $type = NULL;
        
        foreach ( $types as $typeId => $pattern ) {
        
            switch  ( $pattern ) {
                case '__DIRECTORY__':
                    if ( is_dir( $path . DIRECTORY_SEPARATOR . $file ) ||
                            is_dir( $file ) ) $type = $typeId;
                    break;
                
                case '__FILE__':
                    
                    if ( is_file( $path . DIRECTORY_SEPARATOR . $file ) ||
                            is_file( $file ) ) $type = $typeId;
                    break;
                
                default:
                    if ( preg_match('/' . $pattern . '/i' , $file ) )
                        $type = $typeId;
                        
                    break;
            }
            
            if ( $type !== NULL ) break;
        }
        
        return $type;
    }
    
    public static function search ( $p = array() , $options = array() ) {
        global $config;
    
        $path = '/';
        if ( array_key_exists('path',$p) ) $path = $p['path'] . $path;

        // Building the absolute requested path :
        $path = $config['path'] . $path;
        
        // Executing local file system command :
        $offset = 0; $limit = $config['limit'];
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
        
            chdir( $path );
//            $cmd = 'find "'. $path .'" -maxdepth 5 -iregex "'. $search .'"';
            $cmd = 'find . -maxdepth 5 -iregex "'. $search .'" | sed "s/\.\///"';
            //$cmd = 'ls --group-directories-first -X "'. $search .'"';
            
        } else {
            $cmd = 'ls --group-directories-first -X "'. $path .'"';
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
        if ( array_key_exists( 'organize' , $options ) ) {
            // Filtering results :
            $r = array();
            
            foreach ( $results as $i => $result ) {
            
                $type = self::getType( $config['path'] . $p['path'] , $result );
                
                if  ( !array_key_exists( $type , $r ) ) $r[$type] = array();
                $r[$type][] = $result;
            }
        }
        
        Api_Utils::log( 'Files found : ' . 1 , LOG_DEBUG , __METHOD__ );
        
        return $r;
    }
    
    public function downloadAction (){ 
        global $config;
    
        $p = $p != NULL ? $p : Api_Utils::readToken();
        
        header('Content-Disposition: attachment; filename="'. preg_replace('/.*\//','',$p['path']) .'"');
        
        return $this->accessAction( $p );
    }
    
    public function accessAction ( $p = NULL ) {
        global $config;
    
        $p = $p != NULL ? $p : Api_Utils::readToken();
        
        chdir( '../../web' );
        
        // TODO : Improve this...
        $temporaryFolder = '.tmp';
        if ( !is_dir( $temporaryFolder ) ) mkdir( $temporaryFolder );
        chdir( $temporaryFolder );
        
        if ( array_key_exists('path',$p) ) {
            $path = $config['path'] . $p['path'];
            
            switch ( true ) {
                case preg_match( '/'.$config['types']['video'].'/i' , $path ):
                    header("Content-Type: video/x-msvideo" );
                case preg_match( '/'.$config['music']['extensions'].'/i' , $path ):
                    
                    if ( preg_match( '/'.$config['types']['video'].'/i' , $path ) || isset($_SERVER['HTTP_RANGE']) )  { // do it for any device that supports byte-ranges not only iPhone
                        
                        
                        //Api_Utils::exec( 'find ./* -mtime +1 -exec rm {} \;' );
                        Api_Utils::exec( 'find ./* -mmin +60 -exec rm {} \;' );// Remove all temporary files older than an hour.
                        
                        $tmpFile = uniqid() . uniqid() . preg_replace( '/.*\/[^\.]+/' , '' , $path );
                        symlink( $path , $tmpFile );
                        
                        $mime = mime_content_type( $path );
                        error_log( 'mime = ' . $mime );
                        //header("Content-Type: " . $mime );
                        
                        header('Location: ' . preg_replace( '/api.php/' , '.tmp/' . $tmpFile , $_SERVER['REQUEST_URI']));
                        die();
                        
                        //header("Content-Type: audio/mp3");
                        //$this->_rangeDownload($path);
	                } else {
	                    $fp = fopen($path, 'r');
	                
                        // REF : http://stackoverflow.com/questions/9629223/audio-duration-returns-infinity-on-safari-when-mp3-is-served-from-php
                        $fsize = filesize( $path );
                        $etag = md5( serialize( fstat($fp) ) );
                        
                        $mime = mime_content_type( $path );
                        
                        header("Pragma: public");
                        header("Expires: 0"); 
                        header("Content-Transfer-Encoding: binary");
                        header("Content-Type: " . $mime );
                        header("Content-Type: application/zip");
                        header("Content-Description: File Transfer");
                        header('Content-Length: ' . $fsize);
                        header('Content-Disposition: inline; filename="' . $p['path'] . '"');
                        header( 'Content-Range: bytes 0-'.($fsize-1).'/'.$fsize); 
                        header( 'Accept-Ranges: bytes');
                        header('X-Pad: avoid browser bug');
                        header('Cache-Control: no-cache');
                        header('Etag: ' . $etag);
                        
                        fclose($fp);
	                }
                    break;
            }
            
            if ( file_exists( $path ) ) {
                
                if ( preg_match( '/\.json$/' , $path ) ) {
                    echo Api_Utils::outputJson( file_get_contents( $path ) );
                    die();
                }
                
                readfile( $path );
            
            } else {
            
                die('File does not exists.');
                
            }
        }
    }
    
    public function previousAction () { return $this->siblingAction( -1 ); }
    public function nextAction () { return $this->siblingAction( 1 ); }
    
    public function siblingAction ( $direction = 1 , $options = array() ) {
        global $config;
        
        $p = Api_Utils::readToken();
        
        if ( file_exists( $config['path'] . '/' . $p['path'] ) ) {
            $file = preg_replace( '/^.*\/([^\/]+)$/' , '$1' , $p['path'] );
            $p['path'] = preg_replace( '/^(.*)\/[^\/]+$/' , '$1' , $p['path'] );
        }
        
        // Determine the looking file index in search results :
        $p['offset'] = Api_Get_File::search( $p , array(
            'indexOf' => $file
        )) ;
        
        //$p['offset'] = 0;
        $p['limit'] = 50;// Maximum
        
        if ( $direction < 0 ) $p['offset'] -= $p['limit']; 
        
        $r = Api_Get_File::search( $p );
        
        //$index = array_search( $file , $r );
        $path = $config['path'] . '/' . $p['path'];
        $type = '';
        if ( array_key_exists('strict',$options) && $options['strict'] )
            $type = self::getType( $path , $file );
        
        if ( in_array( $file , $r ) ) { unset( $r[ array_search( $file ,$r ) ] ); sort( $r ); }
        if ( $direction < 0 ) $r = array_reverse( $r );
        
        for ( $i = 0 ; $i < count( $r ) ; $i++ ) {
            if ( isset( $r[ $i * $direction ] ) &&
                ( $strict == '' || $strict == self::getType( $path , $r[ $i * $direction ] ) )) {
                $result = array(
                    'path' => $p['path'] . '/' . $r[ $i * $direction ] ,
                    'name' => $r[ $i * $direction ]
                );
                break;
            }
        }
        
        echo Api_Utils::outputJson( $result );
        die();
        
    }
    
    public function searchAction () {
        global $config;
        
        $p = Api_Utils::readToken();
        
        $r = Api_Get_File::search( $p , array(
            'organize' => false
        ));

        echo Api_Utils::outputJson( $r );
        die();
    }
    
    public function detailsAction () {
        global $config;
        
        $p = Api_Utils::readToken();
        
        $path = $config['path'] . $p['path'];
        
        if ( is_dir( $path ) ) {
            chdir( $path );
        
            $counts = array();
            foreach ( $config['types'] as $type => $pattern ) {
            
                switch  ( $pattern ) {
                    case '__DIRECTORY__':
                        $cmd = 'ls --directory */';
                        $count = Api_Utils::exec( $cmd . ' | wc -l' );
                        $counts[$type] = intval( $count[0] );
                        break;
                    default:
                        $cmd = 'find "'. $path .'" -iregex ".*'. preg_replace( '/(\(|\)|\||\$)/' , "\\\\$1", $pattern ) .'"';
                        $count = Api_Utils::exec( $cmd . ' | wc -l' );
                        $counts[$type] = intval( $count[0] );
                        break;
                }
                
            }
            
            echo Api_Utils::outputJson( $counts );
            die();
        
        } else if ( file_exists( $path ) ) {
        }
        
        
    }
    
    /**
     * List all the folders and files present in a specific folder.
     */
    public function listAction () { return $this->searchAction(); }
}
