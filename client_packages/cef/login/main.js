$('.throwError').hide()

mp.events.add('b.throwError', (err) => {
	$('.throwError').show().html(err)
})

function sendAccountInfo(state) {
	switch (state) {
		case 0:
			mp.events.call('client:loginData', $('#loginName').val(), $('#loginPass').val())
			break
		case 1:
			if ($('#registerPass').val() === $('#registerPass2').val()) {
				mp.events.call('client:registerData', $('#registerName').val(), $('#registerEmail').val(), $('#registerPass').val())
			} else {
				mp.events.call('b.throwError', 'password-mismatch')
			}
			break
		default:
			break
	}
}
