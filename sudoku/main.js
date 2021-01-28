const OFFSET = 5;
const THINSTROKE = 1;
const THICKSTROKE = 2.5;
const CORNER_OFFSETS = [[-1,-1], [1,-1], [-1,1], [1,1], [0,-1], [-1,0], [0,1], [1,0], [0,0]];
const COLORS = ["#9995", "#1115", "#c435", "#ea45", "#dd25", "#5a25", "#5cc5", "#76e5", "#d6e5"]

let board;
let decorations;
let title;
let description;
let selected = [];
let center_pencilmarks = [];
let corner_pencilmarks = [];
let highlighting = [];
let grid_layer, select_layer, digit_layer, pencilmark_layer, highlight_layer;

function redraw_all() {
	redraw_highlights();
	redraw_select();
	redraw_grid();
	redraw_digits();
	redraw_pencilmarks();
	redraw();
}

function redraw_select() {
	ctx = select_layer.getContext("2d");
	let size = select_layer.width;
	ctx.clearRect(0,0,size,size);
	let spacing = (size-2*OFFSET)/Math.max(board.size[0], board.size[1]);

	ctx.fillStyle = "#e8d83388";
	for (let select of selected) {
		let bx = select[0]*spacing + OFFSET;
		let by = select[1]*spacing + OFFSET;
		ctx.fillRect(bx, by, spacing, spacing);
	}
}

function redraw_grid() {
	ctx = grid_layer.getContext("2d");
	let size = grid_layer.width;
	ctx.clearRect(0,0,size,size);
	let spacing = (size-2*OFFSET)/Math.max(board.size[0], board.size[1]);
	ctx.lineJoin = "round";
	ctx.lineCap = "round";

	ctx.beginPath();
	for (let x = 0; x < board.size[0]+1; x++) {
		let bx = x * spacing + OFFSET;
		ctx.moveTo(bx, OFFSET);
		ctx.lineTo(bx, size-OFFSET);
	}
	for (let y = 0; y < board.size[1]+1; y++) {
		let by = y * spacing + OFFSET;
		ctx.moveTo(OFFSET, by);
		ctx.lineTo(size-OFFSET, by);
	}
	ctx.closePath();
	ctx.lineWidth = THINSTROKE;
	ctx.stroke();
	for (let decoration of decorations) {
		draw_decoration(ctx, size, spacing, decoration);
	}
}

function redraw_digits() {
	ctx = digit_layer.getContext("2d");
	let size = digit_layer.width;
	ctx.clearRect(0,0,size,size);
	let spacing = (size-2*OFFSET)/Math.max(board.size[0], board.size[1]);
	
	
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = Math.floor(spacing/2) + "pt 'Roboto', sans";

	let xoff = spacing/2 + OFFSET;
	let yoff = spacing*2/3 - spacing/10 + OFFSET;

	for (let idx in board.contents) {
		if (board.contents[idx]) {
			let x = idx % board.size[0];
			let y = Math.floor(idx / board.size[0]);
			let text = board.contents[idx] + "";
			if (board.givens[idx]) {
				ctx.fillStyle = "#000";
			} else {
				ctx.fillStyle = "#12e";
			}
			ctx.fillText(text, x*spacing + xoff, y*spacing + yoff);
		}
	}
}

function redraw_pencilmarks() {
	ctx = pencilmark_layer.getContext("2d");
	let size = pencilmark_layer.width;
	ctx.clearRect(0,0,size,size);
	let spacing = (size-2*OFFSET)/Math.max(board.size[0], board.size[1]);
	
	
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = Math.floor(2*spacing/9) + "pt 'Roboto', sans";

	let xoff = spacing/2 + OFFSET;
	let yoff = spacing/2 + OFFSET;

	ctx.fillStyle = "#12e";
	for (let idx in center_pencilmarks) {
		if (center_pencilmarks[idx] && !board.contents[idx]) {
			let x = idx % board.size[0];
			let y = Math.floor(idx / board.size[0]);
			let text = center_pencilmarks[idx].join("");
			ctx.fillText(text, x*spacing + xoff, y*spacing + yoff);
		}
	}
	for (let idx in corner_pencilmarks) {
		if (corner_pencilmarks[idx] && !board.contents[idx]) {
			let x = idx % board.size[0];
			let y = Math.floor(idx / board.size[0]);
			let bx = x*spacing+xoff;
			let by = y*spacing+yoff;
			for (n in corner_pencilmarks[idx]) {
				let pencil = corner_pencilmarks[idx][n];
				let loc = CORNER_OFFSETS[n];
				ctx.fillText(pencil + "", bx + loc[0]*spacing/4, by + loc[1]*spacing/4);
			}
		}
	}
}

function redraw_highlights() {
	ctx = highlight_layer.getContext("2d");
	let size = highlight_layer.width;
	ctx.clearRect(0,0,size,size);
	let spacing = (size-2*OFFSET)/Math.max(board.size[0], board.size[1]);

	for (let idx in highlighting) {
		if (highlighting[idx]) {
			let col = COLORS[highlighting[idx]-1];
			let bx = (idx % 9)*spacing + OFFSET;
			let by = Math.floor(idx / 9)*spacing + OFFSET;
			ctx.fillStyle = col;
			ctx.fillRect(bx, by, spacing, spacing);
		}
	}
}

function redraw() {
	let canvas = document.getElementById("boardcanvas");
	let ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(highlight_layer, 0, 0);
	ctx.drawImage(select_layer, 0, 0);
	ctx.drawImage(grid_layer, 0, 0);
	ctx.drawImage(digit_layer, 0, 0);
	ctx.drawImage(pencilmark_layer, 0, 0);
}

function on_resize() {
	let canvas = document.getElementById("boardcanvas");
	let size = Math.min(window.innerWidth*0.85, window.innerHeight)*0.8 - 150;
	canvas.width = size;
	canvas.height = size;
	grid_layer.width = canvas.width;
	grid_layer.height = canvas.height;
	select_layer.width = canvas.width;
	select_layer.height = canvas.height;
	digit_layer.width = canvas.width;
	digit_layer.height = canvas.height;
	pencilmark_layer.width = canvas.width;
	pencilmark_layer.height = canvas.height;
	highlight_layer.width = canvas.width;
	highlight_layer.height = canvas.height;
	redraw_all();
}

function load_from_json(json) {
	let res = json;
	if (!res.board) {
		res = JSON.parse(json);
	}
	if (res == null || res == undefined) {
		alert("Error loading puzzle from file");
		return
	}
	board = {};
	if (res.board === "sudoku" || res.board === "plain") {
		board.size = [9,9];
	} else {
		board.size = res.board;
	}
	if (res.givens) {
		board.givens = res.givens.map(x => (x == 0 ? undefined : x));
	} else {
		board.givens = [];
	}
	board.contents = [...board.givens];
	description = "";
	if (res.description) {
		description = res.description;
	}
	title = "CTCDIY";
	if (res.title) {
		title = res.title;
	}
	decorations = []
	if (res.decorations) {
		decorations = res.decorations;
	}
	if (res.board === "sudoku") {
		decorations.unshift({"type":"sudoku_grid"});
	}
	center_pencilmarks = [];
	corner_pencilmarks = [];
	document.getElementById("title").innerHTML = title;
	document.getElementById("description").innerHTML = description;
	redraw_all();
}

function draw_decoration(ctx, size, spacing, decoration) {
	if (decoration.type === "sudoku_grid") {
		ctx.beginPath();
		ctx.moveTo(OFFSET, OFFSET);
		ctx.lineTo(OFFSET, size-OFFSET);
		ctx.lineTo(size-OFFSET, size-OFFSET);
		ctx.lineTo(size-OFFSET, OFFSET);
		ctx.lineTo(OFFSET, OFFSET);
		ctx.moveTo(OFFSET+spacing*3, OFFSET);
		ctx.lineTo(OFFSET+spacing*3, size-OFFSET);
		ctx.moveTo(OFFSET+spacing*6, OFFSET);
		ctx.lineTo(OFFSET+spacing*6, size-OFFSET);
		ctx.moveTo(OFFSET, OFFSET+spacing*3);
		ctx.lineTo(size-OFFSET, OFFSET+spacing*3);
		ctx.moveTo(OFFSET, OFFSET+spacing*6);
		ctx.lineTo(size-OFFSET, OFFSET+spacing*6);
		ctx.lineWidth = THICKSTROKE;
		ctx.strokeStyle = "#000";
		ctx.closePath();
		ctx.stroke();
	} else if (decoration.type === "border") {
		ctx.beginPath();
		ctx.moveTo(decoration.path[0][0]*spacing + OFFSET, decoration.path[0][1]*spacing + OFFSET);
		for (let node of decoration.path.slice(1)) {
			ctx.lineTo(node[0]*spacing + OFFSET, node[1]*spacing + OFFSET);
		}
		ctx.lineWidth = THICKSTROKE;
		ctx.strokeStyle = "#000";
		ctx.closePath();
		ctx.stroke();
	} else if (decoration.type === "killercage") {
		let path = decoration.path;
		ctx.beginPath();
		let top_offset = offset_to_coords(path[0].offset);
		top_offset = [0.075*top_offset[0]*spacing, 0.075*top_offset[1]*spacing]
		let top_x = path[0].pos[0]*spacing + top_offset[0] + OFFSET;
		let top_y = path[0].pos[1]*spacing + top_offset[1] + OFFSET;
		ctx.moveTo(top_x, top_y);
		for (let node of path.slice(1)) {
			let offset = offset_to_coords(node.offset);
			ctx.lineTo(
				(node.pos[0] + 0.075*offset[0])*spacing + OFFSET,
				(node.pos[1] + 0.075*offset[1])*spacing + OFFSET
			);
		}
		ctx.closePath();
		ctx.setLineDash([4,4]);
		ctx.strokeStyle = "#000";
		ctx.stroke();
		ctx.setLineDash([]);
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.font = Math.floor(2*spacing/9) + "pt 'Roboto', sans";
		ctx.lineSize = THINSTROKE*0.5;
		if (decoration.value) {
			ctx.fillStyle = "#fffa";
			ctx.fillRect(top_x-top_offset[0], top_y-top_offset[1], 6*top_offset[0], 6*top_offset[1]);
			ctx.fillStyle = "#000";
			ctx.fillText(decoration.value + "", top_x + top_offset[0]*1.5, top_y + top_offset[1]*1.5);
		}
	} else if (decoration.type === "kropki") {
		let x = decoration.pos[0]*spacing + OFFSET;
		let y = decoration.pos[1]*spacing + OFFSET;
		ctx.beginPath();
		ctx.arc(x, y, spacing/8, 0, 2*Math.PI);
		ctx.lineWidth = THICKSTROKE/2 + THINSTROKE/2;
		ctx.strokeStyle = "#000";
		if (decoration.color) {
			ctx.fillStyle = decoration.color
		} else {
			ctx.fillStyle = "#fff";
		}
		ctx.fill();
		ctx.stroke();
		
	}
}

let is_mouse_down = false;

function on_mouse_down(event) {
	is_mouse_down = true;
	let x = event.pageX - event.target.offsetLeft;
	let y = event.pageY - event.target.offsetTop;
	let [cx, cy] = canvas2cell(x, y);
	select_cell(cx, cy, event.ctrlKey || event.shiftKey ? "modifier" : "both");
	redraw_select();
	redraw();
}

function on_mouse_up(event) {
	is_mouse_down = false;
}

function on_mouse_move(event) {
	if (is_mouse_down) {
		let x = event.pageX - event.target.offsetLeft;
		let y = event.pageY - event.target.offsetTop;
		let [cx, cy] = canvas2cell(x, y);
		select_cell(cx, cy, "add");
		redraw_select();
		redraw();
	}
}

function canvas2cell(x, y, target) {
	let size = event.target.width;
	let spacing = (size-2*OFFSET)/Math.max(board.size[0], board.size[1]);
	let cx = Math.floor((x - OFFSET)/spacing);
	let cy = Math.floor((y - OFFSET)/spacing);
	return [cx, cy];
}

function select_cell(cx, cy, mode) {
	if (mode == "add" || mode == "modifier") {
		if (cx < 0 || cy < 0 || cx >= board.size[0] || cy >= board.size[1]) {
			return
		}
		let found = false;
		for (let idx in selected) {
			if (selected[idx][0] == cx && selected[idx][1] == cy) {
				if (mode == "modifier") {
					selected.splice(idx, 1);
				}
				found = true;
				break;
			}
		}
		if (!found) {
			selected.push([cx, cy]);
		}
	} else {
		if (cx < 0 || cy < 0 || cx >= board.size[0] || cy >= board.size[1]) {
			selected = [];
			return
		}
		if (selected.length == 1 && selected[0][0] == cx && selected[0][1] == cy) {
			selected = [];
		} else {
			selected = [[cx,cy]];
		}
	}
}

function on_keydown(event) {
	if (event.osKey) return;
	if (event.keyCode == 18) {
		event.preventDefault();
		return;
	}
	if (event.altKey && !event.ctrlKey && !event.shiftKey) {
		event.preventDefault();
	}
	if (event.keyCode >= 49 && event.keyCode <= 57) {
		if (selected.length == 0) {
			return
		}
		let n = event.keyCode - 48;
		on_number(n, event.shiftKey, event.ctrlKey, event.altKey);
		event.preventDefault();
	} else if (event.keyCode == 8 || event.keyCode == 46 || event.keyCode == 32) {
		if (selected.length == 0) {
			return
		}
		on_number(undefined, false, false, event.altKey);
		event.preventDefault();
	} else if (event.keyCode >= 37 && event.keyCode <= 40) {
		if (selected.length > 0) {
			let sx = selected[0][0];
			let sy = selected[0][1];
			if (event.keyCode == 37) sx -= 1;
			if (event.keyCode == 38) sy -= 1;
			if (event.keyCode == 39) sx += 1;
			if (event.keyCode == 40) sy += 1;
			sx += board.size[0];
			sy += board.size[0];
			sx %= board.size[0];
			sy %= board.size[0];
			selected = [[sx, sy]];
			redraw_select();
			redraw();
		}
		event.preventDefault();
	} else if (event.keyCode == 27) {
		if (selected.length == 0) {
			return
		}
		selected = [];
		redraw_select();
		redraw();
		event.preventDefault();
	} else {
		//console.log(event);
	}
}

function on_number(n, shift, ctrl, alt) {
	if (alt) {
		for (let pos of selected) {
			let idx = pos[0] + pos[1]*board.size[0];
			highlighting[idx] = n;
		}
		redraw_highlights();
		redraw();
		return
	}
	if (n) {
		for (let pos of selected) {
			let idx = pos[0] + pos[1]*board.size[0];
			if (!board.givens[idx]) {
				if (ctrl || shift) {
					arr = ctrl ? center_pencilmarks : corner_pencilmarks;
					if (!arr[idx]) {
						arr[idx] = [n];
					} else {
						if (arr[idx].indexOf(n) >= 0) {
							arr[idx] = arr[idx].filter(x => x != n);
						} else {
							arr[idx].push(n);
							arr[idx].sort();
						}
					}
				} else {
					board.contents[idx] = n;
				}
			}
		}
	} else {
		for (let pos of selected) {
			let idx = pos[0] + pos[1]*board.size[0];
			if (!board.givens[idx]) {
				if (board.contents[idx]) {
					board.contents[idx] = undefined;
				} else {
					center_pencilmarks[idx] = undefined;
					corner_pencilmarks[idx] = undefined;
				}
			}
		}
	}
	redraw_pencilmarks();
	redraw_digits();
	redraw();
}

var getJSON = function(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.responseType = 'json';
	xhr.onload = function() {
	  var status = xhr.status;
	  if (status === 200) {
		callback(null, xhr.response);
	  } else {
		callback(status, xhr.response);
	  }
	};
	xhr.send();
};

function on_load_from_url(event) {
	let url = document.getElementById("loadurl").value;
	getJSON(url, function(error, data) {
		load_from_json(data);
	});
}

function on_load_from_upload(event) {
	let files = event.target.files;
	if (files.length == 0) return;
	let file = files[0];
	let reader = new FileReader();
	reader.onload = (e) => {
		load_from_json(e.target.result);
	}
	reader.onerror = (e) => {
		alert("Error uploading file");
	}
	reader.readAsText(file);
}

function offset_to_coords(offset) {
	switch (offset) {
		case "c": return [0,0];
		case "n": return [0,-1];
		case "s": return [0,1];
		case "w": return [-1,0];
		case "e": return [1,0];
		case "nw": return [-1,-1];
		case "ne": return [1,-1];
		case "se": return [1,1];
		case "sw": return [-1,1];
		default: return undefined;
	}
}
