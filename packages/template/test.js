module.exports.init = async function(){
    await timeout(2000);
    console.log('Server test package loaded.')
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}