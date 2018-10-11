function setValoresPorDefecto(){
	$("#max-tiempo-llegada").val(4);
	$("#max-cantidad-clientes").val(5);
	$("#duracion-simulacion").val(5);
	$("#cantidad-servicios").val(1);


	$("#clientes-espera").val(0);
	$("#taquillas-abiertas").val(0);
	$("#clientes-atendidos").val(0);
	$("#tiempo-transcurrido").val(0);

}

function agregarServicio() {
	cantidadServicios = $("#cantidad-servicios").val();
	

	$("#div-servicios").append('<div class="panel panel-primary" id="panel-servicio-'+cantidadServicios+'"><div class="panel-heading">Servicio #'+cantidadServicios+'</div><div class="panel-body"><form class="form-horizontal" role="form"><div class="form-group"><label for="nombre-servicio-'+cantidadServicios+'" class="col-xs-5 control-label">Nombre</label><div class="col-xs-7"><input type="text" class="form-control" id="nombre-servicio-'+cantidadServicios+'" placeholder="Nom. Servicio #'+cantidadServicios+'" value=""></div></div><div class="form-group"><label for="duracion-servicio-'+cantidadServicios+'" class="col-xs-5 control-label">Tiempo (seg)</label><div class="col-xs-7"><input type="text" data-ride="spinner" id="duracion-servicio-'+cantidadServicios+'" class="form-control input-number" value="1" data-min="1"></div></div></form></div></div>');

	cantidadServicios++;
}

function eliminarServicio() {
	cantidadServicios = $("#cantidad-servicios").val();
	if((cantidadServicios*1+1)>1){
		$("#panel-servicio-"+(cantidadServicios*1+1)).remove();
	}
}



function inicializar() {
	simulacionIniciada = true;
	tiempoMaxLlegada = $("#max-tiempo-llegada").val();
	cantidadMaxClientes = $("#max-cantidad-clientes").val();
	duracionSimulacion = $("#duracion-simulacion").val();
	cantidadServicios = $("#cantidad-servicios").val();
	taquillasAbiertas = $("#taquillas-abiertas").val()*1;

	servicios = [];
	for (var i = 1; i <= cantidadServicios; i++) {
		servicios[i] = {
			"nombre":$("#nombre-servicio-"+i).val(),
			"duracion":$("#duracion-servicio-"+i).val()
		};
	}

	$("#max-tiempo-llegada").attr('readonly', 'true');
	$("#max-cantidad-clientes").attr('readonly', 'true');
	$("#duracion-simulacion").attr('readonly', 'true');
	$("#cantidad-servicios").attr('readonly', 'true');
	$("#taquillas-abiertas").attr('readonly', 'true');

	$("#max-tiempo-llegada").addClass('disabled');
	$("#max-cantidad-clientes").addClass('disabled');
	$("#duracion-simulacion").addClass('disabled');
	$("#cantidad-servicios").addClass('disabled');
	$("#taquillas-abiertas").addClass('disabled');

	$(".btn-ocultar").addClass("hidden");
}



function atenderClientes() {

	var taquillasNecesarias = Math.ceil((clientesEnEspera.length+clientesEnAtencion.length) / (cantidadMaxClientes*1.0));

	//Abriendo taquillas si es necesario
	while(taquillasNecesarias>taquillasAbiertas){
		taquillasAbiertas++;
		$("#taquillas-abiertas").val(taquillasAbiertas);
	}
	

	//Agregar clientes a taquillas de atencion
	while(clientesEnAtencion.length<taquillasAbiertas && clientesEnEspera.length){
		clientesEnAtencion.push(clientesEnEspera[0]);
		clientesEnEspera.splice(0, 1);
		$("#clientes-espera").val(clientesEnEspera.length+clientesEnAtencion.length);

	}

	//Actualizando el progreso de la atención
	var clientesListos = [];
	for (var i = 0; i < clientesEnAtencion.length; i++) {
		id =clientesEnAtencion[i];
		tiempoActual = $("#tiempo-actual-cliente-"+id).val();
		tiempoActual++;
		tiempoTotal = $("#tiempo-total-cliente-"+id).val();
		progreso = (tiempoActual/tiempoTotal);

		progreso = (progreso+"").substring(0, 4);
		progreso *=100;
		progreso = Math.floor(progreso);

		if(progreso<33){
			$("#barra-cliente-"+id).attr("class", "progress-bar progress-bar-danger progress-bar-striped active");
			
		}else{
			if(progreso<66){
				$("#barra-cliente-"+id).attr("class", "progress-bar progress-bar-warning progress-bar-striped active");
			}else{
				if(progreso<100){
					$("#barra-cliente-"+id).attr("class", "progress-bar progress-bar-primary progress-bar-striped active");
				}else{
					$("#barra-cliente-"+id).attr("class", "progress-bar progress-bar-success progress-bar-striped");
					clientesListos.push(id);
				}
			}
		}

		$("#tiempo-actual-cliente-"+id).val(tiempoActual);
		$("#barra-cliente-"+id).attr("style", "width: "+progreso+"%;");
		$("#barra-cliente-"+id).text(progreso+"%");
	}
	
	//Sacar clientes listos de las taquillas
	for (var j = 0; j < clientesListos.length; j++) {
		for (var k=0; k < clientesEnAtencion.length; k++) {
			if(clientesEnAtencion[k]==clientesListos[j]){
				clientesEnAtencion.splice(k, 1);
				clientesAtendidos = $("#clientes-atendidos").val();
				clientesAtendidos++;
				$("#clientes-atendidos").val(clientesAtendidos);
				break;
			}
		}
	}
	
	//Cerrando taquillas si es necesario
	taquillasNecesarias = Math.ceil((clientesEnEspera.length+clientesEnAtencion.length) / (cantidadMaxClientes*1.0));
	while(taquillasAbiertas>taquillasNecesarias && taquillasAbiertas>1){
		taquillasAbiertas--;
		$("#taquillas-abiertas").val(taquillasAbiertas);
	}

}

function actualizarTiempoTranscurrido(p1, p2) {
	tiempoTranscurrido = $("#tiempo-transcurrido").val()*1+1;
	$("#tiempo-transcurrido").val(tiempoTranscurrido);

	$("#clientes-espera").val(clientesEnEspera.length+clientesEnAtencion.length);

	atenderClientes();

	if(tiempoTranscurrido>=(duracionSimulacion*60)){
		detener();
	}
}

totalClientes = 0;
filas = 0;
flagNuevaFila = true;
clientesEnEspera = [];
clientesEnAtencion =[];

function dibujarCliente(tipoDeServicioAleatorio) {
	var nombreServicio = servicios[tipoDeServicioAleatorio].nombre;
	var duracionServicio = servicios[tipoDeServicioAleatorio].duracion;

	if(flagNuevaFila){
		filas++;
		flagNuevaFila = false;
		$("#div-clientes-cola").append('<div class="row" id="fila-clientes-'+filas+'"><div class="col-xs-6"><div class="row"><div class="col-xs-7"><b>#'+totalClientes+' </b><span class="glyphicon glyphicon-shopping-cart"></span><b> '+nombreServicio+'</b><i> ('+(1*tiempoDeLlegadaAleatorio/1000)+' seg)</i><input type="hidden" id="tiempo-total-cliente-'+totalClientes+'" value="'+duracionServicio+'"><input type="hidden" id="tiempo-actual-cliente-'+totalClientes+'" value="0"></div><div class="col-xs-5"><div class="progress"><div id="barra-cliente-'+totalClientes+'" class="progress-bar progress-bar-success  progress-bar-striped active" role="progressbar" style="width: 0%;"></div></div></div></div></div></div>');
	}else{
		flagNuevaFila = true;
		$("#fila-clientes-"+filas).append('<div class="col-xs-6"><div class="row"><div class="col-xs-7"><b>#'+totalClientes+' </b><span class="glyphicon glyphicon-shopping-cart"></span><b> '+nombreServicio+'</b><i> ('+(1*tiempoDeLlegadaAleatorio/1000)+' seg)</i><input type="hidden" id="tiempo-total-cliente-'+totalClientes+'" value="'+duracionServicio+'"><input type="hidden" id="tiempo-actual-cliente-'+totalClientes+'" value="0"></div><div class="col-xs-5"><div class="progress"><div id="barra-cliente-'+totalClientes+'" class="progress-bar progress-bar-success  progress-bar-striped active" role="progressbar" style="width: 0%;"></div></div></div></div></div>');
	}
}

function simularClienteCliente() { 
	totalClientes++;

	clientesEnEspera.push(totalClientes);

	var tipoDeServicioAleatorio = Math.floor((Math.random() * cantidadServicios+1));
	dibujarCliente(tipoDeServicioAleatorio);

    clearInterval(hiloClientes);

    tiempoDeLlegadaAleatorio = Math.floor((Math.random() * (tiempoMaxLlegada*1+1))) *1000;

    hiloClientes = setInterval(simularClienteCliente, tiempoDeLlegadaAleatorio); // start the setInterval()

}

function validarTiempoDeServicios(){
	cantidadServicios = $("#cantidad-servicios").val();
	servicios = [];
	for (var i = 0; i < cantidadServicios; i++) {
		if(!Number.isInteger($("#duracion-servicio-"+(1*i+1)).val()*1) || $("#duracion-servicio-"+(1*i+1)).val()<1){
			alert("La duración del servicio #"+(1*i+1)+" debe ser un número entero mayor a 1");
			return false;
		}

		nombre = $.trim($("#nombre-servicio-"+(1*i+1)).val());
		if ((!nombre) || (nombre.length > 8)){
			alert("El nombre del servicio #"+(1*i+1)+" debe tener entre 1 y 8 Caracteres");
			return false;
		}
	}

	return true;
}

function iniciar() {
	if(validarTiempoDeServicios()){
		inicializar();
		cronometro = setInterval(actualizarTiempoTranscurrido, 1000, 3, 2); 

		tiempoDeLlegadaAleatorio = Math.floor((Math.random() * (tiempoMaxLlegada*1+1))) *1000;
		hiloClientes = setInterval(simularClienteCliente , tiempoDeLlegadaAleatorio);
		$("#btn-iniciar").attr('class', 'hidden');
		$("#btn-detener").attr('class', 'btn btn-danger');
	}

	
}

function detener() {
	clearInterval(hiloClientes);
	clearInterval(cronometro);
	$("#btn-detener").attr('class', 'hidden');
	$("#btn-reiniciar").attr('class', 'btn btn-warning');
}

function reiniciar() {
	$("#cantidad-servicios").val(1);
	location.reload();
}

$(setValoresPorDefecto());