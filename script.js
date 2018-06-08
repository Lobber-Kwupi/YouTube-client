window.lastsearch = ''; 
window.nextpagetoken = ''; 
window.isload = false; 

//шаблонизатор для видео
function TemplateEngine(result){
	return ''+
	'<div class="queryres">'+
		'<a href="https://www.youtube.com/watch?v='+result.id.videoId+'">'+
			'<img src="'+result.snippet.thumbnails.medium.url+'" class=queryres" alt="Result thumbnail">'+
		'</a>'+
	'</div>'+
	'<div class="res-data">'+
		'<div class="title">'+result.snippet.title+'</div><br>'+
        '<div class="descript">'+result.snippet.description+'</div><br> '+
		'<div class="author"><a href="https://www.youtube.com/channel/'+result.snippet.channelId+'?autoplay=1">'+result.snippet.channelTitle+'</a></div>'+
		'<div class="publdate">Опубликовано: '+result.snippet.publishedAt.substring(0,10)+'</div><br>'
    '</div>';
}

//добавление следующего результата 
function nextresult(result){
	var cont = document.getElementById('contentblk');
	
	if(result.nextPageToken) { 
		window.nextpagetoken = result.nextPageToken;
	}
	for (k in result.items){ 
		var newItem = document.createElement('div'); 
		newItem.className = 'output'; 
		newItem.innerHTML = TemplateEngine(result.items[k]); 
		cont.appendChild(newItem); 
	}
	window.isload = false; //контент загружен
}

//получение объекта XMLHttpRequest
function GetXHR(){
  if(typeof XMLHttpRequest === 'undefined'){
    XMLHttpRequest = function() {
      try { return new window.ActiveXObject( "Microsoft.XMLHTTP" ); }
        catch(e) {}
    };
  }
  return new XMLHttpRequest();
}

//получение результатов YouTube API
function getResult(input){
	
	if(input) { //пришло с формы
		window.lastsearch = input; //новый запрос
		document.getElementById('contentblk').innerHTML = ''; //новый запрос ставим пустоту
	}else{
		input = window.lastsearch; //подгрузка берем записанные в глобалку данные
	}
	if(!input){ //если пустой запрос обнуляем контент блок
		document.getElementById('contentblk').innerHTML = '';
		return false;
	}
	
	//параметры запроса
	var QueryParam = {
		part: 'id,snippet',
		videoDuration: 'any',
		key: 'AIzaSyDz2z_glwwz3ACp6ep0mvb_EImAi7o2XYs',
		q: window.lastsearch+' in:video',
		maxResults: 20,
	};
    
    var str = '';
	for (k in QueryParam){
		str += k+'='+QueryParam[k]+'&';
	}
	
	if(window.nextpagetoken){ 
		QueryParam.pageToken = window.nextpagetoken;
	}
	window.isload = true; 
	var XHR = GetXHR();
	XHR.open('GET', 'https://www.googleapis.com/youtube/v3/search?'+str, true);
	XHR.onreadystatechange = function() {
	  if(XHR.readyState == 4 && XHR.status == 200){
		var result = JSON.parse(XHR.responseText);
		nextresult(result); 
	  }
	}
	XHR.send(null);

}


document.addEventListener("DOMContentLoaded", function(event) {

	var mousepos, to;
	var clicked = false; //нажата мышь
	
	
	var contentblk = document.getElementById('contentblk');
	var coef = 1.5; //кеф для ускорения прокрутки
	
	contentblk.addEventListener("mousedown", onclick, false);
	contentblk.addEventListener("mousemove", onmove, false);
	document.addEventListener("mouseup", onunclick, false);
	contentblk.addEventListener("mouseup", onunclick, false);
	
	//нажатие мыши
	function onclick(e) {
		mousepos = e.screenX; 
		clicked = true;  
		return;
	}
	//перемещение мыши
	function onmove(e) {
		if(!clicked) return; 
		
		clearTimeout(to); 
		var delta = (e.screenX - mousepos) * coef; 
		to = setTimeout(function () {  
			contentblk.scrollLeft = contentblk.offsetLeft + contentblk.scrollLeft - delta; 
			mousepos = e.screenX; 
			
			//подгрузка результатов
			if(!window.isload && (contentblk.scrollWidth - contentblk.offsetWidth - contentblk.scrollLeft)<180) getResult();
			
		}, 10);
		
	}
	//отпустили кнопку мыши
	function onunclick(e){
		clicked = false; //клика теперь нет, блок не крутим
		setTimeout(function () { //таймаут на прокрутке
			contentblk.scrollLeft = Math.floor(contentblk.scrollLeft/318) * 318; //смещаем блок влево если перекрутили
		},20);
		return;
	}

},false);