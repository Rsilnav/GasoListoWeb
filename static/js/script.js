/* Author: YOUR NAME HERE
*/

$(document).ready(function() {   

  var socket = io.connect();

  $('#sender').bind('click', function() {
   socket.emit('message', 'Message Sent on ' + new Date());     
  });

  socket.on('server_message', function(data){
   $('#receiver').append('<li>' + data[0] + ' ' + data[1] +'</li>');  
  });

  $('#buscar').bind('click', function() {
  	var texto = $('#cp').val();
  	$('#receiver').empty();
  	console.log(texto);
   	socket.emit('buscar', texto);

  });

});