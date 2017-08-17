ip_address = "lab.songli.io/imageCompare"
address = "http://lab.songli.io/compare/"
// send information to utils function
function send_to_utils(command) {
  res = ""
  $.ajax({
    url: "http://" + ip_address + "/utils",
    type: 'POST',
    async: false,
    data: {
      key: command
    },
    success: function(data) {
      res = data;
    },
    error: function(xhr, ajaxOptions, thrownError) {
    }
  });
  return res; 
}

// get all of the tests
function get_keys() {
  keys = send_to_utils("get_list").split('!@#$');
  return keys;
}

// gengerate keys
function get_result() {
  var keys = get_keys();
  console.log(keys);
  var curr_label = "!@#$%^&";
  for (var idx in keys) {
    parts = keys[idx].split('~');
    ip = parts[0];
    time = parts[1];
    agent = parts[2];
    id = parts[3];
    label = parts[4];

    if (curr_label != label) {
      curr_label = label;
      var label_1 = $('<option value = "' + label + '" disabled>' + label + '</option>');
      $("#select_1").append(label_1);
      var label_2 = $('<option value = "' + label + '" disabled>' + label + '</option>');
      $("#select_2").append(label_2);
    }

    var b_1 = $('<option value = "' + id + '">' + ip + '_' + agent + '_' + time + '_' + label + '</option>');
    var b_2 = $('<option value = "' + id + '">' + ip + '_' + agent + '_' + time + '_' + label + '</option>');
    $("#select_1").append(b_1);
    $("#select_2").append(b_2);
  }
}

function get_pictures(column) {
  var id = $("select[id=select_" + column + "]").val();
  input_id = (document.getElementById('input_' + column).value);
  if (input_id != "") id = parseInt(input_id);
  console.log(id);
  get_pictures_by_id(column, id);
}

function clearEntry() {
  var id = $("select[id=select_1]").val();
  var res = send_to_utils("delete-entry," + id); 
  alert("Entry " + res + " deleted");
}

// add picture to html
function get_pictures_by_id(column, id) {
  // clear this div
  $('#picture_' + column).empty();

  var img = new Image();
  // the cross origin cliam have to before src attrabute
  img.crossOrigin="Anonymous";
  img.id = column;
  img.src = address + id + '.png';
  $('#picture_' + column).append(img);
}

// this function is used to get the pixels of a img
// var: img html object
// return: array of pixels
function get_pixel_from_img(img_id) {
  var img = document.getElementById(img_id); 
  var width = img.clientWidth;
  var height = img.clientHeight;
  // the canvas may be taint for cross origin info
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  var context = canvas.getContext('2d');
  context.drawImage(img, 0, 0);
  data = context.getImageData(0, 0, width, height);
  delete canvas;
  return data; 
}


function sub_pic_data(pic1_data, pic2_data) {
  var sub_data = pic1_data;
  var same = true;
  for (var i in pic1_data.data) {
    // both the two will be considered
    sub_data.data[i] = Math.abs(pic1_data.data[i] - pic2_data.data[i]);

    // here we make the pixels 100 times brighter
    // may overflow, but seems ok
    sub_data.data[i] *= 100;

    // force set every alpha value to be 255
    if (i % 4 == 3) {
      sub_data.data[i] = 255;
    }else if (sub_data.data[i] != 0) {
      same = false;
    }
  }
  sub_data.same = same;
  return sub_data;
}

// subtract all the imgs
function subtract() {
  // clear the res div
  $('#subtract').empty();

  var sub_data
  $.ajax({
    url: "http://" + ip_address + "/utils",
    type: 'POST',
    async: false,
    data: {
        key: 'subtract',
        id1: $("select[id=select_1]").val(),
        id2: $("select[id=select_2]").val()
    },
    success: function(data) {
        console.log(data);
      sub_data = data;
    },
    error: function(xhr, ajaxOptions, thrownError) {
    }
  });

  // here we only have 29 pictures
  //pic1_data = get_pixel_from_img("1");
  //pic2_data = get_pixel_from_img("2");
  //var sub_data = sub_pic_data(pic1_data, pic2_data);

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  canvas.width = Math.sqrt(sub_data.dif.length);
  canvas.height = canvas.width;
  var imgData = ctx.createImageData(canvas.width, canvas.height);
  var i = 0;
  var count = 0;
  for (var w = 0; w < imgData.data.length; w+=4) {
      imgData.data[w+0] = sub_data.dif[i][0];
      imgData.data[w+1] = sub_data.dif[i][1];
      imgData.data[w+2] = sub_data.dif[i][2];
      imgData.data[w+3] = 255;
      i++;
      if(sub_data.dif[i][0] != 0||sub_data.dif[i][1] != 0|| sub_data.dif[i][2] != 0)count++;
  }
  console.log("diff pixel: " + count);
  ctx.putImageData(imgData, 0, 0);
  $('#subtract').append(canvas);

  var res_img = new Image(); 
  res_img.height = "32";
  res_img.width = "32";
  res_img.align = "top";
  if (sub_data.value == 0) {
    res_img.src = "./img/yes.png";
  } else {
    res_img.src = "./img/no.png";
  } 

  $('#subtract').append(res_img);
}

// this function is used to clear all the data
function clear_all_data() {
  var password = prompt("Input your password to clear data: ");
  res = send_to_utils("delete_all," + password);
  alert(res);
}
