console.log('Client-side code running');

const commandLine = document.getElementById('commandLine');
commandLine.onkeypress = handleCommand;

function handleCommand(e){
	if(e.code == "Enter"){
	    console.log("Enter clicked.");
		fetch('/commandSent', {
			method: 'POST',
		    headers: {
		      'Accept': 'application/json',
		      'Content-Type': 'application/json'
		    },
			body: JSON.stringify({username: getUsername(), password: getPassword(), command: document.getElementById("commandLine").value})
		})
	    .then(function(response) {
	      if(response.ok) {
	        console.log("Enter clicked on server.");
	        updateLog();
	        return;
	      }
	      throw new Error('Request failed.');
	    })
	    .catch(function(error) {
	      console.log(error);
	    });
	}
}

function updateLog(){
	fetch('/getLog', {
		method: 'POST',
	    headers: {
	      'Accept': 'application/json',
	      'Content-Type': 'application/json'
	    },
		body: JSON.stringify({username: getUsername(), password: getPassword()})
	})
    .then(function(response) {
      if(response.ok) {
        response.json().then(data => {
		  for(let line of data.log){
		  	console.log(line);
		  }
		});

        return;
      }
      throw new Error('Request failed.');
    })
    .catch(function(error) {
      console.log(error);
    });
}

function getUsername(){
	return "banjo";
}

function getPassword(){
	return "password";
}