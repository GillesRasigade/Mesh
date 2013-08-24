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

class Api_Get_Exif {

    protected static $_exifMapping = array(
        'FileName'              => array(
            'var' => 'filename',
        ),
        'FileSize'              => array(
            'var' => 'size',
            'function' => 'return number_format(round(__value__/1e6,2),1) . " Mo";'
        ),
        'MimeType'              => array(
            'var' => 'mime',
        ),
        'RelatedImageWidth'     => array(
            'var' => 'width',
        ),
        'RelatedImageHeight'    => array(
            'var' => 'height',
        
        ),
        'Model'                 => array(
            'var' => 'model',
        ),
        'Orientation'           => array(
            'var' => 'orientation',
        
        ),
        'XResolution'           => array(
            'var' => 'resolutionX',
        ),
        'YResolution'           => array(
            'var' => 'resolutionY',
        ),
        'ResolutionUnit'        => array(
            'var' => 'resolutionYnit',
        ),
        'ExposureTime'          => array(
            'var' => 'exposure',
        ),
        'FNumber'               => array(
            'var' => 'focal',
            'function' => 'return "f" . number_format(round(__value__,1),1);'
        ),
        'Flash'                 => array(
            'var' => 'flash',
        
        ),
        'DateTime'              => array(
            'var' => 'date',
        ),
    );
    
    public function __construct ( $path ) {
        $this->path = $path;
        
        $this->readExif();
    }
    
    public function getExif () { return $this->readExif(); }
    public function readExif ( $path = '' ) {
        if ( $this->exif == NULL ) {
            $path = $path != '' ? $path : $this->path;
            $this->exif = array();
            
            if ( function_exists("read_exif_data") ) {
                $data = exif_read_data( $path , "IFD0");
			    if ($data !== FALSE) {
			        //foreach ( $data as $k => $v ) { var_dump( $k , $v ); echo '<br/>'; }
			    
			        foreach ( self::$_exifMapping as $key => $params ) {
			            if ( array_key_exists($key,$data) ) {
			                $value = $data[$key];
			                
			                if ( array_key_exists('function',$params) ) {
			                    $func = create_function('', preg_replace('/__value__/',$value,$params['function']) );
			                    $value = $func();
			                }
			                
			                $this->exif[$params['var']] = $this->{$params['var']} = $value;
			            }
			        }
			    }
            }
        }
        return $this->exif;
    }
}
