class node {
  constructor(x, y, group) {
    this.x = x;
    this.y = y;
    this.group = group;
  }
}

var cur_stat;
var arrNode = new Array();
var centroid = new Array();
var group_num = 0;
var myvar;
var type = "";
var x_start = -1;
var y_start = -1;
var x_end = -1;
var y_end = -1;

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
        y = coords[0];
        x = coords[1];
        if (this.className == "grid" || this.className == "grid-transition") {
          this.className = "node";
          arrNode.push(new node(x, y, 0));
        } else if (this.className == "node") {
          this.className = "grid";
          for (var k = 0; k < arrNode.length; k++) {
            if (arrNode[k].x == x && arrNode[k].y == y) {
              arrNode.splice(k, 1);
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
              this.className == "grid-transition") && type!="start-node" && type!="end-node"
            ) {
              this.className = "node";
              arrNode.push(new node(x, y, 0));
            } else if (this.className == "node") {
              this.className = "grid";
              for (var k = 0; k < arrNode.length; k++) {
                if (arrNode[k].x == x && arrNode[k].y == y) {
                  arrNode.splice(k, 1);
                }
              }
            }else if (type=="start-node"){
              start = document.getElementById(y_start + "-" + x_start);
              start.setAttribute("class", "grid");
              this.className = "start-node";
              x_start = x;
              y_start = y;
            }
            else if (type=="end-node"){
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
  y_start = 7;
  start = document.getElementById(y_start + "-" + x_start);
  start.setAttribute("class", "start-node");

  x_end = 42;
  y_end = 7;
  start = document.getElementById(y_end + "-" + x_end);
  start.setAttribute("class", "end-node");

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

function reset_grid() {
  stop_cycle();
  arrNode = new Array();
  grid = document.getElementById("board").getElementsByTagName("td");
  for (var i = 0; i < grid.length; i++) {
    grid[i].setAttribute("class", "grid");
  }
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
function djikstra(){
  
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
