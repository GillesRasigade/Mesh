<?php

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
