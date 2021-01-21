$('.throwError').hide()

$('form').on('submit', function (e) {   
    e.preventDefault()
})

function sendAccountInfo(state) {
	switch (state) {
		case 0:
			mp.events.call('c.loginData', $('#loginName').val(), $('#loginPass').val())
			break
		case 1:
			if ($('#registerPass').val() !== $('#registerPass2').val()) return throwError('password-mismatch')
			mp.events.call('c.registerData', $('#registerName').val(), $('#registerEmail').val(), $('#registerPass').val())
			break
	}
}

function throwError(err) {
	$('.throwError').show().html(err)
}

mp.events.add('b.throwError', (err) => {
	throwError(err)
})
