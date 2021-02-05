const errorMsg = {
	"password-mismatch": "Passwords do not match, please type them again.",
	"logged": "That account is already logged in.",
	"invalid-info": "The email you provided is not valid.",
	"takeninfo": "The username or email you have provided is taken.",
	"tooshort": "The username or password you have provided is too short",
	"incorrectinfo": "The username or password you have entered is incorrect."
}

$('.alert').hide();

$('form').submit(function(e){
	e.preventDefault()
})

function sendAccountInfo(state) {
	$('.alert').hide();
	switch (state) {
		case 0:
			mp.events.call('client:loginData', $('#loginName').val(), $('#loginPass').val());
			break;
		case 1:
			if ($('#registerPass').val() == $('#registerPass2').val()) {
				mp.events.call('client:registerData', $('#registerName').val(), $('#registerEmail').val(), $('#registerPass').val());
			} else {
				throwError('password-mismatch');
			}
			break;
		default:
			break;
	}
}

function throwError(err) {
	$('.alert').show().html(errorMsg[err]);
}

mp.events.add('b.throwError', (err) => {
	throwError(err);
})
