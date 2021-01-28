[Click here](https://trimill.github.io/ctcdiy/sudoku) to open the interface. A list of example puzzles is available [here](https://trimill.github.io/ctcdiy/puzzles).

# About
CTCDIY is an online sudoku application inspired by [Cracking the Cryptic](https://www.youtube.com/channel/UCC-UOdK8-mIjxBQm_ot1T-Q)'s [application](https://app.crackingthecryptic.com/). Unlike theirs, however, CTCDIY allows you to upload your own puzzles as JSON files. Some examples are available with the link above, and more will be added as more features are released. Currently, there is support for NxN square boards, irregular sudokus, killer sudokus, and kropki sudokus (and any modification that doesn't require new additions to the grid, eg. knight's move).

# Using the website
Puzzles can be loaded either from a URL or from a local file. The file format is described below. Once the puzzle is loaded you can begin playing. Controls are shown on the right side of the screen.

* Click a cell to select it. `Ctrl`+click, `Shift`+click, or drag to select multiple cells.
* Use the arrow keys to move the selected cell.
* Use the number keys `1`to `9` to enter digits.
* Use the number keys with `Ctrl` to enter center pencilmarks.
* Use the number keys with `Shift` to enter corner pencilmarks.
* Use the number keys with `Alt` to highlight cells.
* Use `Backspace`, `Delete`, or `Space` to clear a cell.
* Use `Alt` with `Backspace`, `Delete`, or `Space` to remove highlighting.

# Puzzle format
Puzzles are stored as `JSON`. The only required field is `board`, the rest are optional.
| Name          | Type                                                                                 | Description                                                                                                                                                 |
| `board`       | Array of two integers (width and height) or string (either `"sudoku"` or `"plain"` ) | Specifies the dimensions of the board. Both `"sudoku"` and `"plain"` create a 9x9 board, `"sudoku"` additionally adds darker lines to create the 3x3 boxes. |
| `title`       | String                                                                               | Shown at the top of the page                                                                                                                                |
| `description` | String                                                                               | Shown below the puzzle                                                                                                                                      |
| `givens`      | Array of integers, length at most `width * height`                                   | Place unchangeable digits into the puzzle.                                                                                                                  |
| `decorations` | Array of objects (see below)                                                         | Add decorations to the puzzle (eg. borders, cages, highlighting)                                                                                            |

# Decorations
Any combination of decorations can be applied to a puzzle. Decorations have no function. Each decoration is an object with the field `type` specifying the object's type. Each decoration is used in at least one puzzle (linked above)
| Type          | Other fields                | Description                                                                                                                                                                                                                |
| `sudoku_grid` | None                        | Draws darker borders around the 3x3 cells. Used internally with `"board": "sudoku"`                                                                                                                                        |
| `border`      | `path`                      | Draws darker borders along a custom path. The elements of `path` are positions of grid intersections                                                                                                                       |
| `killercage`  | `path`, `value` (optional)  | Draws a killer sudoku cage. The elements of `path` contain two fields: `pos`, a grid intersection position, and `offset`, a direction. `value` represents the sum of the cage and is drawn at the first element of `path`. |
| `kropki`      | `pos`, `color` (optional)   | Draws a Kropki dot. To line it up between two cells, one coordinate of `pos` should end with a `.5`, the other should be whole. `color` defaults to white if not provided.                                                 |

## Types
* Position: an array of length 2 representing an [x, y] pair. Top-left is [0,0], increasing right and down. Depending on usage, this may refer to a cell or to a gridline intersection.
* Direction: a value describing a direction, one of `c` (center), `n`, `s`, `e`, `w` (cardinal directions), `nw`, `ne`, `sw`, `se` (diagonals)
