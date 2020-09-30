class Wall {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Pairs {
  constructor(a, b, dist) {
    this.origin = a;
    this.destination = b;
    this.distance = dist;
  }
}

var cur_stat;
var arrWall = new Array();
var intervalVisited;
var intervalPath;
var type = "";
var x_start = -1;
var y_start = -1;
var x_end = -1;
var y_end = -1;
var cost = [];
var queue = [];
var visited = [];
var final_path = [];
var visual_started = false;

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
        if (
          (this.className == "grid" || this.className == "grid-transition") &&
          !visual_started
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
        }
      });
      tag.addEventListener("mousedown", function () {
        cur_stat = this.id;
        elem = document.getElementById(cur_stat);
        type = elem.className;
      });
      tag.addEventListener("mouseenter", function () {
        if (mouseDown == true && !visual_started) {
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
              if (x != x_end || y != y_end) {
                start = document.getElementById(y_start + "-" + x_start);
                start.setAttribute("class", "grid");
                this.className = "start-node";
                x_start = x;
                y_start = y;
              }
            } else if (type == "end-node") {
              if (x != x_start || y != y_start) {
                end = document.getElementById(y_end + "-" + x_end);
                end.setAttribute("class", "grid");
                this.className = "end-node";
                x_end = x;
                y_end = y;
              }
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
  // console.log(cost);

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

//matrix initiation
function initiate_matrix() {
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

//reset function
function reset_grid() {
  //stopping animation
  stop_cycle();
  //renewing arrays
  renew_arrays();
  //resetting board state
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
  arrWall = new Array();
  cost = [];
  queue = [];
  visited = [];

  //reinitiate matrix
  initiate_matrix();
  //resetting visual state
  visual_started = false;
}
function renew_arrays() {
  queue = new Array();
  arrWall = new Array();
  visited = new Array();
  final_path = new Array();
}
function toggle_cycle() {
  cycle_view = document.getElementById("cycle_view");
  if (cycle_view.style.display == "none") cycle_view.style.display = "block";
  else cycle_view.style.display = "none";
}
function stop_cycle() {
  if (intervalVisited) clearInterval(intervalVisited);
  if (intervalPath) clearInterval(intervalPath);
  // cycle_view = document.getElementById("cycle_view");
  // cycle_view.style.display = "none";
  // btn = document.getElementById("btn-visualize");
  // btn.disabled = false;
}

//establising walls in the matrix
function establish_walls(arrWall, cost) {
  arrWall.forEach(function (item) {
    point = item.y * 55 + item.x;
    index_top = (item.y - 1) * 55 + item.x;
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
}
function trace_back(end_node, final_path) {
  traversed_node = end_node;
  while (traversed_node != start_node) {
    min_dist = 999;
    next_node = traversed_node;
    for (var i = visited.length - 1; i >= 0; i--) {
      if (visited[i].destination == traversed_node) {
        if (visited[i].distance < min_dist) {
          min_dist = visited[i].distance;
          next_node = visited[i].origin;
        }
      }
    }
    final_path.push(next_node);
    traversed_node = next_node;
  }
}
//// AI METHODS
function dijkstra() {
  if (!visual_started) {
    //defining walls
    establish_walls(arrWall, cost);

    //disabling mouse actions
    visual_started = true;

    //initializing finish state
    start_node = y_start * 55 + x_start;
    end_node = y_end * 55 + x_end;

    active_node = start_node;
    cur_cost = 0;
    queue.push(new Pairs(active_node, active_node, 0));

    while (active_node != end_node) {
      //searching neighbors and establishing queues
      for (var i = 0; i < cost.length; i++) {
        if (cost[active_node][i] != 0 && cost[active_node][i] != 999) {
          // checking if already visited
          already_visited = false;
          for (var j = 0; j < visited.length; j++) {
            if (visited[j].origin == i) {
              already_visited = true;
              break;
            }
          }
          if (!already_visited) {
            //checking if already queued
            already_queued = false;
            perceived_distance = cost[active_node][i] + cur_cost;
            for (var j = 0; j < queue.length; j++) {
              if (queue[j].destination == i) {
                if (queue[j].distance > perceived_distance) {
                  queue.splice(j, 1);
                } else {
                  already_queued = true;
                }
                break;
              }
            }
            if (!already_queued) {
              queue.push(new Pairs(active_node, i, perceived_distance));
            }
          }
        }
      }
      //sorting the queue
      sorted = true;
      do {
        sorted = true;
        for (var i = 0; i < queue.length - 1; i++) {
          if (queue[i].distance > queue[i + 1].distance) {
            temp = queue[i];
            queue[i] = queue[i + 1];
            queue[i + 1] = temp;
            sorted = false;
          }
        }
      } while (!sorted);
      visited.push(queue[0]);
      // y_temp = Math.floor(queue[0].destination / 55);
      // x_temp = queue[0].destination % 55;
      // color_visited = document.getElementById(y_temp + "-" + x_temp);
      // if (color_visited.className != "start-node")
      //   color_visited.setAttribute("class", "group1");
      queue.splice(0, 1);
      active_node = queue[0].destination;
      cur_cost = queue[0].distance;
    }
    //end node
    visited.push(queue[0]);
    final_path = [];
    final_path.push(end_node);

    //tracing the path
    trace_back(end_node, final_path);

    //visualization
    visualize_visited(visited, final_path);
  }
  //visualize visited
  function visualize_visited(visited, final_path) {
    count = 0;
    intervalVisited = setInterval(function () {
      y_temp = Math.floor(visited[count].destination / 55);
      x_temp = visited[count].destination % 55;
      color_visited = document.getElementById(y_temp + "-" + x_temp);
      if (
        color_visited.className != "start-node" &&
        color_visited.className != "end-node"
      )
        color_visited.setAttribute("class", "group1");
      count++;
      if (count == visited.length) {
        clearInterval(intervalVisited);
        visualize_path(final_path);
      }
    }, 1);
  }
  //visualize final_path
  function visualize_path(final_path) {
    counter = 0;
    intervalPath = setInterval(() => {
      coor_x = final_path[counter] % 55;
      coor_y = Math.floor(final_path[counter] / 55);
      path_step = document.getElementById(coor_y + "-" + coor_x);
      if (
        path_step.className != "start-node" &&
        path_step.className != "end-node"
      )
        path_step.setAttribute("class", "group2");
      counter++;
      if (counter == final_path.length) clearInterval(intervalPath);
    }, 30);
  }
}
