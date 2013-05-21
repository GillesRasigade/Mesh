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
