class Wall {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

var cur_stat;
var arrWall = new Array();
var myvar;
var type = "";
var x_start = -1;
var y_start = -1;
var x_end = -1;
var y_end = -1;
var cost = [];

function view_dropdown() {
  dropdown = document.getElementsByClassName("dropdown-menu")[0];
  if (dropdown.style.display == "block") {
    dropdown.style.display = "none";
  } else {
    dropdown.style.display = "block";
  }
}

//estrablishing functions and generating grid
function generate() {
  group_num = 0;
  for (i = 0; i < 20; i++) {
    var tag = document.createElement("tr");
    tag.setAttribute("id", "row " + i);
    document.getElementById("board").appendChild(tag);
    for (j = 0; j < 55; j++) {
      var tag = document.createElement("td");
      tag.setAttribute("class", "grid");
      tag.setAttribute("id", i + "-" + j);
      tag.addEventListener("click", function () {
        cur_stat = this.id;
        coords = this.id.split("-");
        y = parseInt(coords[0]);
        x = parseInt(coords[1]);
        if (this.className == "grid" || this.className == "grid-transition") {
          this.className = "node";
          arrWall.push(new Wall(x, y));
        } else if (this.className == "node") {
          this.className = "grid";
          for (var k = 0; k < arrWall.length; k++) {
            if (arrWall[k].x == x && arrWall[k].y == y) {
              arrWall.splice(k, 1);
            }
          }
        }
      });
      tag.addEventListener("mousedown", function () {
        cur_stat = this.id;
        elem = document.getElementById(cur_stat);
        type = elem.className;
      });
      tag.addEventListener("mouseenter", function () {
        if (mouseDown == true) {
          coords = this.id.split("-");
          y = parseInt(coords[0]);
          x = parseInt(coords[1]);
          if (this.id != cur_stat) {
            if (
              (this.className == "grid" ||
                this.className == "grid-transition") &&
              type != "start-node" &&
              type != "end-node"
            ) {
              this.className = "node";
              arrWall.push(new Wall(x, y));
            } else if (this.className == "node") {
              this.className = "grid";
              for (var k = 0; k < arrWall.length; k++) {
                if (arrWall[k].x == x && arrWall[k].y == y) {
                  arrWall.splice(k, 1);
                }
              }
            } else if (type == "start-node") {
              start = document.getElementById(y_start + "-" + x_start);
              start.setAttribute("class", "grid");
              this.className = "start-node";
              x_start = x;
              y_start = y;
            } else if (type == "end-node") {
              end = document.getElementById(y_end + "-" + x_end);
              end.setAttribute("class", "grid");
              this.className = "end-node";
              x_end = x;
              y_end = y;
            }
          }
          cur_stat = this.id;
        }
      });
      document.getElementById("row " + i).appendChild(tag);
      // array_grid.push(new grid(j, i));
    }
  }

  //initialize start
  x_start = 12;
  y_start = 9;
  start = document.getElementById(y_start + "-" + x_start);
  start.setAttribute("class", "start-node");

  x_end = 42;
  y_end = 9;
  start = document.getElementById(y_end + "-" + x_end);
  start.setAttribute("class", "end-node");
  
  initiate_matrix();
  console.log(cost);

  var mouseDown = false;
  body = document.getElementById("board");
  body.addEventListener("mouseup", function () {
    mouseDown = false;
    cur_stat = null;
    type = null;
  });
  body.addEventListener("mousedown", function () {
    mouseDown = true;
  });
  cycle_view = document.getElementById("cycle_view");
  cycle_view.style.display = "none";
  
}

function initiate_matrix(){
  for (var from = 0; from < 1100; from++) {
    cost.push([0]);
    for (var to = 0; to < 1100; to++) {
      //constituting the coordinates from index and the adjacent squares
      coor_x = from % 55;
      coor_y = Math.floor(from / 55);
      index_top = (coor_y - 1) * 55 + coor_x;
      index_left = coor_y * 55 + coor_x - 1;
      index_right = coor_y * 55 + coor_x + 1;
      index_bottom = (coor_y + 1) * 55 + coor_x;

      if (from == to) cost[from][to] = 0;
      else if (to == index_top && coor_y > 0) cost[from][to] = 1;
      else if (to == index_left && coor_x > 0) cost[from][to] = 1;
      else if (to == index_right && coor_x < 54) cost[from][to] = 1;
      else if (to == index_bottom && coor_y < 19) cost[from][to] = 1;
      else cost[from][to] = 999;
    }
  }
}

function reset_grid() {
  stop_cycle();
  arrWall = new Array();
  grid = document.getElementById("board").getElementsByTagName("td");
  for (var i = 0; i < grid.length; i++) {
    grid[i].setAttribute("class", "grid");
  }
  x_start = 12;
  y_start = 9;
  start = document.getElementById(y_start + "-" + x_start);
  start.setAttribute("class", "start-node");

  x_end = 42;
  y_end = 9;
  start = document.getElementById(y_end + "-" + x_end);
  start.setAttribute("class", "end-node");
}

function toggle_cycle() {
  cycle_view = document.getElementById("cycle_view");
  if (cycle_view.style.display == "none") cycle_view.style.display = "block";
  else cycle_view.style.display = "none";
}
function stop_cycle() {
  if (myvar) clearInterval(myvar);
  cycle_view = document.getElementById("cycle_view");
  cycle_view.style.display = "none";
  btn = document.getElementById("btn-visualize");
  btn.disabled = false;
}
//// AI METHODS
function dijkstra() {
  //generating first state
  
  //defining walls
  arrWall.forEach(function (item) {
    point = item.y * 55 + item.x;
    index_top = (item.y- 1) * 55 + item.x;
    index_left = item.y * 55 + item.x - 1;
    index_right = item.y * 55 + item.x + 1;
    index_bottom = (item.y + 1) * 55 + item.x;

    //handles top row
    if (item.y > 0) {
      cost[point][index_top] = 999;
      cost[index_top][point] = 999;
    }
    //handles left side
    if (item.x > 0) {
      cost[point][index_left] = 999;
      cost[index_left][point] = 999;
    }

    //handles right side
    if (item.x < 54) {
      cost[point][index_right] = 999;
      cost[index_right][point] = 999;
    }
    //handles bottom row
    if (item.y < 19) {
      cost[point][index_bottom] = 999;
      cost[index_bottom][point] = 999;
    }
  });

  console.log(cost);
}

function visualize_k_means() {
  if (group_num > 0 && arrNode.length > 0) {
    btn = document.getElementById("btn-visualize");
    btn.disabled = true;
    toggle_cycle();
    var ctr = 0;
    var cycle = 1;
    var convergent = true;
    myvar = setInterval(function () {
      convergent = reestimate_group(arrNode[ctr], centroid, convergent);
      ctr += 1;

      if (ctr == arrNode.length) {
        setTimeout(function () {
          clear_centroid(group_num, centroid);
        }, 400);

        if (convergent) {
          clearInterval(myvar);
          console.log("cycle completed");
          document.getElementById("cycle_view").innerHTML =
            "Cycle : " + cycle + " (Finished)";
        } else {
          setTimeout(function () {
            recalibrate_centroid(group_num, centroid);
            cycle += 1;
            document.getElementById("cycle_view").innerHTML =
              "Cycle : " + cycle;
          }, 1200);
          setTimeout(function () {
            convergent = true;
            ctr = 0;
          }, 2300);
        }
      }
    }, 50);
  } else if (group_num <= 0) {
    btn = document.getElementById("btn-visualize");
    btn.innerHTML = "Set Number of Group!";
  } else if (arrNode.length <= 0) {
    btn = document.getElementById("btn-visualize");
    btn.innerHTML = "Scatter Data First!";
  }
}
