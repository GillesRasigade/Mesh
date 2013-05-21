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

// REF : http://stackoverflow.com/a/2251027
String.prototype.intersection = function(anotherString) {
    var grid = createGrid(this.length, anotherString.length);
    var longestSoFar = 0;
    var matches = [];

    for(var i = 0; i < this.length; i++) {
        for(var j = 0; j < anotherString.length; j++) {
            if(this.charAt(i) == anotherString.charAt(j)) {
                if(i == 0 || j == 0) {
                    grid[i][j] = 1;
                }
                else {
                    grid[i][j] = grid[i-1][j-1] + 1;
                }
                if(grid[i][j] > longestSoFar) {
                    longestSoFar = grid[i][j];
                    matches = [];
                }
                if(grid[i][j] == longestSoFar) {
                    var match = this.substring(i - longestSoFar + 1, i);
                    matches.push(match);
                }
            }
        }
    }
    return matches;
}

// create a 2d array
function createGrid(rows, columns) {
    var grid = new Array(rows);
    for(var i = 0; i < rows; i++) {
        grid[i] = new Array(columns);
        for(var j = 0; j < columns; j++) {
            grid[i][j] = 0;
        }
    }
    return grid;
}
