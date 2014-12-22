"use strict";

var API_URL = "data:text/json,";//"https://example.com/api/";
var globalXHR = new XMLHttpRequest();
var SESSION_ID;

function auth(email, password, callback){
	function onLoadend(e){
		var xhr = e.target;
		xhr.removeEventListener("loadend", onLoadend);
		if(xhr.status != 200){
			callback({error: true, status: xhr.status});
		}else{
			try{
				callback(JSON.parse(xhr.responseText));
			}catch(err){
				callback({error: true});
			}
		}
	}
	globalXHR.addEventListener("loadend", onLoadend);
	globalXHR.open("POST", API_URL+"auth");
	globalXHR.send({email: email, password: password});
}

function loginFormSubmit(e){
	var form = e.target;
	//checks here
	e.preventDefault();
	form.classList.add("loading");

	function onLogin(o){
		form.classList.remove("loading");
		if(o.sessionID){
			SESSION_ID = p.sessionID;
			setView(MAIN_VIEW);

			return;
		}
		if(o.error){
			form.classList.add("error");
		}
	}
	auth(form.email, form.password, onLogin);
}

function init(){
	SESSION_ID = localStorage.SESSION_ID;
	document.forms.login.addEventListener("submit", loginFormSubmit);
}

document.addEventListener("DOMContentLoaded", init);