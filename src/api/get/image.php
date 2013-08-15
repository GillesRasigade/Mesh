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
require_once 'exif.php';

class Api_Get_Image extends Api_Get_File {

    public static function _createThumb ( $p ) {
        global $config;
        
        $original = str_replace( '//' , '/' , $config['path'] . '/' . $p['path'] );
        
        $path = str_replace( '//' , '/' , $config['data'] . '/' . $p['thumb'] );
    
        $folder = preg_replace( '/\/[^\/]+$/' , '' , $path );
        
        // Building the data folder :
        if ( !is_dir( $folder ) ) {
            Api_Utils::createFolder( $folder );
        }
        
        // Read the exif data :
        $exif = new Api_Get_Exif( $original );
        
        // Creation of the thumb image :
        $image = imagecreatefromstring( file_get_contents( $original ) );
        
        // Determination of the image dimensions :
        $width = imagesx($image);
            $height = imagesy($image);
            //$ratio = isset( $config['ratio'][ $p['mode'] ] ) ? $config['ratio'][ $p['mode'] ] : 1 ;

            $w = min( $width , $config[$p['mode']]['width'] );
            $h = min( $height , $config[$p['mode']]['height'] );

            if ( $width > $height ) $h = $w * ( $height / $width );
            else $w = $h * ( $width / $height );

            //$thumb = imagecreatetruecolor($width/$ratio, $height/$ratio);
            $thumb = imagecreatetruecolor($w,$h);
            imagecopyresampled($thumb, $image, 0, 0, 0, 0, $w, $h, $width, $height);

            if ( isset( $exif->orientation ) ) {
                switch ( $exif->orientation ) {
                    case 2:

                        break;
                case 3:
                    $thumb = imagerotate($thumb, 180, 0);
                        break;
                case 4:
                        break;
                case 5:
                        break;
                case 6:
                    $thumb = imagerotate($thumb, -90, 0);
                        break;
                case 7:
                        break;
                case 8:
                    $thumb = imagerotate($thumb, 90, 0);
                        break;
            }
        }
		
        imagejpeg($thumb, $path);

        imagedestroy($image);
    }
    
    public function readExif ( $path ) {
        $exif = array();
        if ( function_exists("read_exif_data") ) {
            $data = exif_read_data( $path , "IFD0");
			if ($data !== FALSE) {
			    foreach ( self::$_exifMapping as $key => $value ) {
			        if ( array_key_exists($key,$data) ) {
			            $exif[$value] = $data[$key];
			        }
			    }
			}
        }
        return $exif;
    }
    
    public function exifAction () {
        global $config;
        
        $p = Api_Utils::readToken();
        
        $exif = array();
        if ( array_key_exists('path',$p) ) {
            $path = $config['path'] . $p['path'];
            
            if ( file_exists( $path ) ) {
            
                // Read the exif data :
                $exif = new Api_Get_Exif( $path );
                
                $exif = $exif->getExif();
            }
        }
        
        echo Api_Utils::outputJson( $exif );
        die();
    }
    
    public function accessAction ( $p = NULL ) {
        global $config;
    
        $p = Api_Utils::readToken();
        
        if ( array_key_exists('path',$p) ) {
            $path = $config['path'] . $p['path'];
            
            if ( is_dir( $path ) ) {
                $path = preg_replace('/\/$/','',$path);
                
                if ( file_exists( $config['data'] . '/' . $p['path'] . '/'.$config['image'][$p['mode']].'-album-cover.jpg') ) {
                    $path = $config['data'] . '/' . $p['path'] . '/'.$config['image'][$p['mode']].'-album-cover.jpg';
                    $p['path'] = '/' . $p['path'] . '/'.$config['image'][$p['mode']].'-album-cover.jpg';
                    unset( $p['mode'] );
                } else {
                    $path = $config['path'] . $p['path'];
                    $cmd = 'cd "'. $path .'"; find . -name "*.png" -o -name "*.jpeg" -o -name "*.jpg" -o -name "*.PNG" -o -name "*.JPEG" -o -name "*.JPG" | head -n 1';
                    
                    $thumb = Api_Utils::exec( $cmd );
                    
                    if ( count( $thumb ) > 0 ) {
                        $path = $path . '/' . preg_replace('/^\.\//','',$thumb[0]);
                        $p['path'] .= '/' . preg_replace('/^\.\//','',$thumb[0]);
                    } else {
                        $path = $config['data'] . '/.system-album.gif';
                        $p['path'] = '/.system-album.gif';
                        unset( $p['mode'] );
                    }
                }
            }
            
            
            if ( file_exists( $path ) ) {
                
                if ( array_key_exists('mode',$p) && array_key_exists($p['mode'],$config['image']) ) {
                
                    $p['thumb'] = preg_replace( '/([^\/]+)$/' , $config['image'][$p['mode']].'-$1' , $p['path'] );
                    $path = $config['data'] . $p['thumb'];
                    
                    if ( !file_exists( $config['data'] . $p['thumb'] ) ) {
                        $this->_createThumb($p);
                    }
                }
                
                if  ( array_key_exists('base64',$p) && $p['base64'] ) {
                
                    // Image data:
                    $imageData = base64_encode(file_get_contents($path));
                    
                    // Format the image SRC:  data:{mime};base64,{data};
                    $src = 'data:'.mime_content_type($path).';base64,'.$imageData;
                    
                    if (!preg_match('/data:([^;]*);base64,(.*)/', $src, $matches)) {
                        die("error");
                    }
                    
                    // Output the correct HTTP headers (may add more if you require them)
                    header('Content-Type: '.$matches[1]);
                    header('Content-Length: '.strlen($src));
                    echo $src;
                
                } else {
                    switch ( true ) {
                        case preg_match('/jpe?g/i',$path):
                            header("Content-type: image/jpeg");
                            break;
                        case preg_match('/png/i',$path):
                            header("Content-type: image/png");
                            break;
                        case preg_match('/gif/i',$path):
                            header("Content-type: image/gif");
                            break;
                    }
                    
                    header("Content-Disposition: inline; filename=\"" . preg_replace('/.*([^\/]+)$/','$1',$path) . "\"");
                    
                    readfile( $path );
                }
            
                
                
                
                exit;
            
            } else {
                die('File does not exists.');
            }
        }
        
        die();
    }
    
    public function listAction () {
        global $config;
        
        $p = Api_Utils::readToken();
        
        $r = Api_Get_File::search( $p , array(
            'organize' => true,
            //'sort' => 'reverse'
        ));

        echo Api_Utils::outputJson( $r );
        die();
    }
}
