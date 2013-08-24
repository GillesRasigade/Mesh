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

// Parse the main ini file :
$config = parse_ini_file('config.ini') + array(
    'limit' => 25
);

// Extract the current git sha version :
$git = $config['sha'] = exec("git rev-parse --verify HEAD;");

if ( isset($config['test']) ) {
    switch ( $config['test'] ) {
        case 'installation':
            
            $pwd = getcwd();
            
            $tests = array(
                'folders' => array(
                    'path' => array(
                        'defined' => NULL,
                        'folder' => NULL,
                        'accessible' => NULL,
                        'writable' => NULL
                    ),
                    'data' => array(
                        'defined' => NULL,
                        'folder' => NULL,
                        'accessible' => NULL,
                        'writable' => NULL
                    ),
                    'logs' => array(
                        'defined' => NULL,
                        'file' => NULL,
                        'writable' => NULL
                    ),
                ),
                
                'applications' => array(
                    'imagemagick' => array(
                        'error' => 'imagemagick is not present on your system.'
                    ),
                    'zip' => array(
                        'error' => 'zip is not present on your system.'
                    ),
                    'ffmpeg' => array(
                        'error' => 'ffmpeg is not present on your system.'
                    ),
                    'cvlc' => array(
                        'error' => 'VLC (cvlc) is not present on your system.'
                    ),
                    'gs' => array(
                        'error' => 'Ghost Script (gs) is not present on your system.'
                    ),
                )
            );
            
            
            // Test folders existence and permissions :
            ?>
            <h1>Installation validation</h1>
            
            <h2>Folders</h2>
            
            <table>
                <thead>
                    <tr>
                        <td>Folder</td><td>Status</td>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ( $tests['folders'] as $folder => $conditions ): ?>
                    <tr>
                        <td><?php echo $config[$folder]; ?></td>
                        <td>
                            <ul>
                                <?php foreach ( $conditions as $condition => &$result ): ?>
                                <li>
                                    <?php switch ( $condition ) {
                                        case 'defined':
                                            echo ( isset($config[$folder]) ? 'correctly defined' : 'not present' ) . ' in configuration file.';
                                            break;
                                        case 'folder':
                                            echo ( is_dir($config[$folder]) ? 'is a folder' : 'is not a folder !' );
                                            break;
                                        case 'accessible':
                                            try {
                                                chdir( $config[$folder] );
                                                echo 'is accessible (chdir).';
                                                chdir( $pwd );
                                            } catch ( Exception $e ) {
                                                echo 'is not accessible (chdir).';
                                            }
                                            break;
                                        case 'file':
                                            echo ( file_exists($config[$folder]) ? 'exists' : 'do not exist !' );
                                            break;
                                        case 'writable':
                                            echo is_writable($config[$folder]) ? 'is writable' : 'is not writable';
                                            break;
                                    } ?>
                                </li>
                                <?php endforeach; ?>
                            </ul>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            
            <h2>External applications</h2>
            
            <table>
                <thead>
                    <tr>
                        <td>Application</td><td>Status</td>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ( $tests['applications'] as $application => $params ): ?>
                    <tr>
                        <td><?php echo $application; ?></td>
                        <td>
                            <ul>
                                <li><?php echo ( exec( 'which ' . $application ) ? exec( 'which ' . $application ) : $params['error'] ); ?></li>
                            </ul>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            
            <?php
            
            die();
            
            break;
    }
    
}
