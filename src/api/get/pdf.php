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

class Api_Get_Pdf extends Api_Get_File {

    public static function _createThumb ( $p ) {
        global $config;
        
        $original = str_replace( '//' , '/' , $config['path'] . '/' . $p['path'] );
        
        $path = str_replace( '//' , '/' , $config['data'] . '/' . $p['thumb'] );
    
        $folder = preg_replace( '/\/[^\/]+$/' , '' , $path );
        
        // Building the data folder :
        if ( !is_dir( $folder ) ) {
            Api_Utils::createFolder( $folder );
        }
        
        $result = Api_Utils::exec("gs -q -dQUIET -dPARANOIDSAFER  -dBATCH -dNOPAUSE -dNOPROMPT -dMaxBitmap=500000000 -dFirstPage=1 -dAlignToPixels=0 -dGridFitTT=0 -sDEVICE=jpeg -dTextAlphaBits=4 -dGraphicsAlphaBits=4 -r100x100 -sOutputFile=\"".$path."\" \"".$original."\"");
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
                    case preg_match('/pdf$/i',$path):
                        header("Content-type: application/pdf");
                        break;
                    case preg_match('/jpe?g/i',$path):
                        header("Content-type: image/jpeg");
                        break;
                }
                
                header("Content-Disposition: inline; filename=\"" . preg_replace('/.*([^\/]+)$/','$1',$path) . "\"");
                
                readfile( $path );
                exit;
            
            } else {
                die('File does not exists.');
            }
        }
        
        die();
    }
}
