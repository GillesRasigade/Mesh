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

class Api_Post_File {

    public function uploadAction() {
        global $config;

        $p = Api_Utils::readToken();
        $status = false;
        $uploaded = 0;
        $count = 0;

        if (array_key_exists('path', $p)) {

            // Save the upload location :
            $path = str_replace('//', '/', $config['path'] . '/' . $p['path']);

            // Count the number of files to process :
            $count = count($_FILES['files']['name']);

            if ($count > 0) {
                for ($i = 0; $i < $count; $i++) {
                    $uploadedFile = $path . '/' . basename($_FILES['files']['name'][$i]);
                    $uploadedFile = preg_replace("/.jpg$/", '.jpeg', $uploadedFile);
                    
                    error_log( $uploadedFile );

                    if (is_uploaded_file($_FILES['files']['tmp_name'][$i])) {
                        if (move_uploaded_file($_FILES['files']['tmp_name'][$i], $uploadedFile)) {
                            // Great success...
                            $uploaded++;
                        }
                    }
                }
            }

            $status = $count;
        }

        $status = $status ? 'success' : 'error';

        echo Api_Utils::outputJson(array(
            'status' => $status,
            'uploaded' => $uploaded,
            'count' => $count
        ));
        die();
    }
    
    public function folderAction () {
        global $config;
        
        $p = Api_Utils::readToken();
        $status = false;
        
        if ( array_key_exists('path',$p) ) {
            chdir( $config['path'] . '/' . $p['path'] );
            
            if ( array_key_exists('name',$p) ) {
                $status = mkdir( $p['name'] );
            }
        }
        
        $status = $status ? 'success' : 'error' ;
        
        echo Api_Utils::outputJson(array(
            'status' => $status,
        ));
        die();
    }
    
    public function fileAction () {
        global $config;
        
        $p = Api_Utils::readToken();
        $status = false;
        
        if ( array_key_exists('path',$p) ) {
            chdir( $config['path'] . '/' . $p['path'] );
            
            if ( array_key_exists('name',$p) ) {
                $status = touch( $p['name'] );
            }
        }
        
        $status = $status ? 'success' : 'error' ;
        
        echo Api_Utils::outputJson(array(
            'status' => $status,
        ));
        die();
    }

}
