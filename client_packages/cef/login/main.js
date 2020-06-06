function sendAccountInfo(state){
    $('.alert-danger').hide();
    if(state === 0){    //Login State
        let loginName = document.getElementById('loginName');
        let loginPass = document.getElementById('loginPass');
        $('#loginBtn').hide();
    
        mp.trigger('client:loginData', loginName.value, loginPass.value);
    } else {    //Register State
        let registerName = document.getElementById('registerName');
        let registerEmail = document.getElementById('registerEmail');
        let registerPass = document.getElementById('registerPass');
        let registerPassCompare = document.getElementById('registerPass2');
        $('#registerBtn').hide();

        if(registerPass.value === registerPassCompare.value){
            mp.trigger('client:registerData', registerName.value, registerEmail.value, registerPass.value);
        } else {
            $('.password-mismatch').show();
            $('#registerBtn').show();
        }
    }
}