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
	$('.alert').show().html(err);
}

mp.events.add('b.throwError', (err) => {
	throwError(err);
})
