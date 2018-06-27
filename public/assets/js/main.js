$().ready(function () {
    $('[data-secret]').click((e) => {
        $(e.target).parent().replaceWith($(e.target).parent().data('secret'))
    });
    $('[name="app_name"]').change(() => {
        let input = $($('[name="app_name"]')[0]);
        $.ajax({
            url: '/api/v1/app/' + $($('[name="app_name"]')[0]).val() + '.exist',
            success: (res) => {
                if (res.exist === true) {
                    input.parent().addClass('has-error');
                } else {
                    if (input.val().length < 4 || input.val().length > 12) {
                        input.parent().addClass('has-error');
                    } else {
                        input.parent().removeClass('has-error');
                    }
                }
            }
        })
    })
    $('#upload_now').click(() => {
        $('#upload_select').click();
    });

    $('#upload_select').on('change', () => {

        let upldr_btn = $('#upload_now');
        upldr_btn.html('<i class="fa fa-spin fa-spinner"></i>');

        if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            alert('The File APIs are not fully supported in this browser.');
            upldr_btn.html('Select Image');
            return;
        }

        input = document.getElementById('upload_select');
        if (!input) {
            alert("Um, couldn't find the fileinput element.");
            upldr_btn.html('Select Image');
        }
        else if (!input.files) {
            alert("This browser doesn't seem to support the `files` property of file inputs.");
            upldr_btn.html('Select Image');
        }
        else if (!input.files[0]) {
            alert("Please select an image before clicking the upload button.");
            upldr_btn.html('Select Image');
        }
        else {
            file = input.files[0];
            fr = new FileReader();
            fr.onload = () => {
                $.pixelUpload({
                    "x-api-key": "4kjCosdIQC9LyXLZIRz04NU0Y6cZOuz2HXRZs89g",
                    "x-api-key-id": "jgitusuglb",
                }, fr.result).then((data) => {
                    $('#previewimage').val(data.secure_url);
                    upldr_btn.html('Select Image');
                })
            };
            //fr.readAsText(file);
            fr.readAsDataURL(file);
        }
    })
});