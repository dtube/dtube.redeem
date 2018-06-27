window.oracle_d = {};

$(() => {

    $('#portal_login').click(() => {
        $('[name="company"]').val("portal");
        $('form').first().submit();
    })

    let template = '<div class="alert alert-secondary mb-1" style="align-items: center">' +
        '<a href="https://%company%.oracle-d.com/oauth/login?access_token=%token%&expires_in=%expires%&username=%username%" class="no-td"><span style="height: 50px; width: 50px;"><div class="SteemitAvatar" style="height: 50px; width: 50px; background-image: url(https://steemitimages.com/u/%username%/avatar);"></div></span>' +
        '<span class="company">%company% as %username%</span></a>'
        +'</div>';
    $.ajax({
        url:'/me',
        success: (res) => {
            if (!$.isEmptyObject(res)) {
                window.oracle_d.accounts = res.accounts;
                let con = $('#logins');
                con.append('<h4>Relogin to:</h4>');
                res.accounts.forEach((login) => {
                    con.append(template.replace(/%username%/g,login.user).replace(/%company%/g,login.portal).replace('%expires%', login.expires_in).replace('%token%',login.access_token))
                });
                con.append('<h5 class="mt-3 mb-1">Or login to:</h5>')
                $('#support').prepend('<div class="text-center mt-4 mb-4 font-weight-light">' +
                    '<a href="#" onclick="logout()"><button type="button" class="btn btn-secondary btn-fw btn-block">Logout from all Apps</button></a>' +
                    '</div>')
            }
        }
    })
});

async function logout() {
    let accounts = window.oracle_d.accounts;
    for (let i = 0; i<=accounts.length-1;i++) {
        await sendLogout(accounts[i].portal);
    }
    window.location.href = '/logout';
}

async function sendLogout(company) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "https://" + company + ".oracle-d.com/oauth/logout",
            success: () => {
                resolve(true);
            }
        })
    })
}

if ($('#global_error').length === 1) {
    setTimeout(() => {
        $('#global_error').fadeOut(1500)
    }, 15000)
}
if ($('#global_info').length === 1) {
    setTimeout(() => {
        $('#global_info').fadeOut(1500)
    }, 3500)
}
