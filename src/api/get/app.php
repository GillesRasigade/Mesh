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

class Api_Get_App {

    /*
     * Get user application parameters
     */
    public function initAction () {
        global $config;
        
        $json = array();
        
        $json['user'] = array();
        $json['user']['login'] = $config['user']['login'];
        $json['user']['admin'] = ( isset($config['user']) && isset($config['user']['admin']) && $config['user']['admin'] );
        
        if ( isset($_SESSION['openId']) && $_SESSION['openId'] === TRUE ) {
            $json['openId'] = array(
                'login' => $_SESSION['login'],
                'timestamp' => $_SESSION['timestamp'],
                'i' => $config['users'][$_SESSION['login']],
            );
        }
        
        
        echo Api_Utils::outputJson($json);
        die();        
    } 

    protected function _line ( &$html = array() , $type = 'log' , $content = '' ) {
        $html[] = array( $type => $content );
    }
    
    public function testAction () {
        Api_Utils::requestAdmin();
    
        global $config;
        $pwd = getcwd();
    
        $html = array();
        
        $this->_line($html,'log','* * * * * * * * * * * * * * * * * * * * * * * * * *');
        $this->_line($html,'log','MESH application tests');
        $this->_line($html,'log','* * * * * * * * * * * * * * * * * * * * * * * * * *');
        $this->_line($html,'log','');
        
        // Testing system command line:
        $this->_line($html,'log','Probing command line functions...');
        $this->_line($html,function_exists('exec') ? 'log' : 'error','- exec() -> ' . ( function_exists('exec') ? 'ok' : 'nok' ));
        $tmp = Api_Utils::exec('pwd');
        $this->_line($html,empty($tmp) ? 'error' : 'log','- exec(\'pwd\') -> ' . ( empty($tmp) ? 'false' : 'ok' ));
        $tmp = Api_Utils::exec('man which');
        $this->_line($html,empty($tmp) ? 'error' : 'log','- exec(\'which\') -> ' . ( empty($tmp) ? 'false' : 'ok' ));
        $tmp = Api_Utils::exec('ls');
        $this->_line($html,empty($tmp) ? 'error' : 'log','- exec(\'ls\') -> ' . ( empty($tmp) ? 'false' : 'ok' ));
        $tmp = Api_Utils::exec('ls | grep ""');
        $this->_line($html,empty($tmp) ? 'error' : 'log','- exec(\'grep\') -> ' . ( empty($tmp) ? 'false' : 'ok' ));
        $tmp = Api_Utils::exec('ls | sort');
        $this->_line($html,empty($tmp) ? 'error' : 'log','- exec(\'sort\') -> ' . ( empty($tmp) ? 'false' : 'ok' ));
        chdir('/tmp'); Api_Utils::rmdir('test');
        $tmp = Api_Utils::exec('mkdir test');
        $this->_line($html,!is_dir('test') ? 'error' : 'log','- exec(\'mkdir\') -> ' . ( !is_dir('test') ? 'false' : 'ok' ));
        $this->_line($html,'log','');
        
        // Testing system applications:
        $this->_line($html,'log','Probing system applications...');
        $tmp = Api_Utils::exec('which convert');
        $this->_line($html,'log','- convert (Image Magick) -> ' . ( empty($tmp) ? 'false' : 'ok' ));
        $tmp = Api_Utils::exec('which zip');
        $this->_line($html,'log','- zip -> ' . ( empty($tmp) ? 'false' : 'ok' ));
        $tmp = Api_Utils::exec('which ffmpeg');
        $this->_line($html,'log','- ffmpeg -> ' . ( empty($tmp) ? 'false' : 'ok' ));
        $tmp = Api_Utils::exec('which cvlc');
        $this->_line($html,'log','- cvlc (VLC) -> ' . ( empty($tmp) ? 'false' : 'ok' ));
        $tmp = Api_Utils::exec('which gs');
        $this->_line($html,'log','- gs (Ghost Script) -> ' . ( empty($tmp) ? 'false' : 'ok' ));
        $this->_line($html,'log','');
        
        // Testing  folders existence, permissions:
        $this->_line($html,'log','Probing folders permissions...');
        
        $folders = array( 'path' , 'data' );
        foreach ( $folders as $i => $folder ) {
            $this->_line($html,'log','- config[\'' . $folder . '\'] ('.$config[$folder].') is...');
            $this->_line($html,isset($config[$folder]) ?'log':'error','--> ' . ( isset($config[$folder]) ? 'correctly defined (ok)' : 'missing (nok) !' ));
            $this->_line($html,is_dir($config[$folder]) ?'log':'error','--> ' . ( is_dir($config[$folder]) ? 'a folder (ok)' : 'is not a folder (nok) !' ));
            
            try {
                chdir( $config[$folder] );
                $this->_line($html,'log','--> is accessible (ok)');
                chdir( $pwd );
            } catch ( Exception $e ) {
                $this->_line($html,'error','--> is not accessible (nok) !');
            }
            
            $this->_line($html,is_writable($config[$folder]) ?'log':'error','--> ' . ( is_writable($config[$folder]) ? 'is writable (ok)' : 'is not writable (nok) !' ));
            $this->_line($html,'log','');
        }
        
        
        echo Api_Utils::outputJson(array(
            'lines' => $html
        ));
        die();
    }
    
    public function panelAction () {
        global $config;
        
        Api_Utils::requestAdmin();
    
        echo Api_Utils::outputJson(array(
            'config' => $config
        ));
        die();
    }
    
    
    
    
    
}
