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

class Api_Get_Github {

    // REF : http://vertstudios.com/blog/github-api-latest-commit-details-php/
    protected function _getJson($url){
        $base = "https://api.github.com/";
        $curl = curl_init();

        $t_vers = curl_version();
        curl_setopt( $curl, CURLOPT_USERAGENT, 'curl/' . $t_vers['version'] );
        curl_setopt($curl, CURLOPT_URL, $base . $url);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);

          //curl_setopt($curl, CONNECTTIMEOUT, 1);
        $content = curl_exec($curl);
        curl_close($curl);
        return $content;
    }

    protected function _getLatestRepo($user) {
        // Get the json from github for the repos
        $json = json_decode($this->_getJson("users/$user/repos"),true);

        // Sort the array returend by pushed_at time
        function compare_pushed_at($b, $a){
            return strnatcmp($a['pushed_at'], $b['pushed_at']);
        }
        usort($json, 'compare_pushed_at');

        //Now just get the latest repo
        $json = $json[0];

        return $json;
    }

    protected function _getCommits($repo, $user){
        // Get the name of the repo that we'll use in the request url
        return json_decode($this->_getJson("repos/$user/$repo/commits"),true);
    }
    
    public function commitsAction () {
        echo Api_Utils::outputJson( $this->_getCommits( 'media-manager' , 'billou-fr' ) );
        die();
    }
    
    public function needPullAction () {
        //git status -uno
    }
    
    public function pullAction () {
        chdir( '../..' );
        $result = Api_Utils::exec( 'git clone git://github.com/billou-fr/media-manager.git' );
        echo Api_Utils::outputJson( array(
            'success' => 'The project has been successfully updated !',
        ));
        die();
    }
}
