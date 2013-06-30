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
    
    // Execute 
    public function streamAction ( $p = NULL ) {
        global $config;
    
        $p = Api_Utils::readToken();
        
        if ( array_key_exists('path',$p) ) {
            $path = $config['path'] . $p['path'];
            
            if ( file_exists( $path ) ) {
                
                $host  = preg_replace('/:.*$/','',$_SERVER['HTTP_HOST']);
//                $host = '82.226.94.148';
//                $host = 'localhost';
                $port = mt_rand(5000,6000);
                
                // Random port definition allows multiple streaming on the same server :
                // TODO : store somewhere already used ports to get determinist port allocation process.
                $rtsp = 'rtsp://'.$host.':'.$port.'/' . $_REQUEST['token'] . '.sdp';
//                $rtsp = 'rtsp://:'.$port.'/' . $_REQUEST['token'] . '.sdp';
//                $rtsp = 'rtsp://0.0.0.0:'.$port.'/' . $_REQUEST['token'] . '.sdp';
//                $rtsp = 'rtsp://localhost:'.$port.'/' . $_REQUEST['token'] . '.sdp';
                
                echo Api_Utils::outputJson( array(
                    'url' => $rtsp//'rtsp://'.$host.':'.$port.'/' . $_REQUEST['token'] . '.sdp'
                ));
                
                // Building VLC command line for VOD :
                $cmd = 'cvlc  -vvv \''.$path.'\' '.
                    ':sub-file=\''.preg_replace('/\.[^\.]+$/','',$path).'.srt\' '.
                    '--sout \''.
                        '#transcode{vcodec=mp2v,vb=512,scale=0.5}'.
                        ':rtp{mux=ts,dst='.$host.',port='.$port.',sdp='.$rtsp.'}'.
//                        ':rtp{mux=ts,port='.$port.',sdp='.$rtsp.'}'.
//                        ':rtp{sdp='.$rtsp.'}'.
                    '\' > /dev/null 2>&1 &';
                
                // Non blocking process execution syntax :
                // REF : http://forum.videolan.org/viewtopic.php?f=4&t=39124
                // REF : http://www.videolan.org/doc/play-howto/en/ch04.html
                // REF : http://www.videolan.org/doc/streaming-howto/en/ch04.html
//                    $result = Api_Utils::exec('cvlc  -vvv \''.$path.'\' --sout \'#transcode{vcodec=mp2v,vb=512,scale=1}:rtp{sdp='.$rtsp.'}\' > /dev/null 2>&1 &');                
                $result = Api_Utils::exec( $cmd );
                    
                die();
                
            }
        }
        
    }
    
    public function stopAction ( $p = NULL ) {
        global $config;
    
        $p = Api_Utils::readToken();
        
        if ( array_key_exists('stream',$p) ) {
            $stream = $p['stream'];
            
            $result = Api_Utils::exec('kill -9 $(ps -ef | grep vlc | grep "'.$stream.'" | grep -v grep | awk \'{print $2}\')');
            
            echo Api_Utils::outputJson( array(
                'success' => 'Stream stopped'
            ));
            
            die();
        }
    }
}
