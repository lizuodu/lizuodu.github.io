;
$(function() {

    function runCheck() {
        if($.browser.msie) {
            var msg = [
               '<h3>非常抱歉，我的简历当前对IE支持不完整;</h3>'
            ].join("");
            $("#notify").setTemplate(msg);
            $("#notify").processTemplateURL("");
            return false;
        }
        return true;            
    }

    function render() {
        var d = new Date();
        var currYear = d.getFullYear();
        $("#resume").setTemplateElement("resumetpl");
        $("#resume").setParam("year", currYear);
        $("#resume").processTemplateURL("../data/resume_cn.json");
    }
    
    function loadPhoto() {
        var photoUrl = "../assets/images/photo.png";
        var $photo = $(".photo");
        $("h1").hover(function(){ 
            $photo.removeClass("out").addClass("fade");
            $.ajax({
                url: photoUrl,
                cache: true
            }).always(function(){
                $photo.find("img").attr("src", photoUrl);
            });
        }, function() {
            $photo.removeClass("fade").addClass("out");
            $photo.find("img").attr("src", null);
        });
    }

    (function init() {
        runCheck() && render();
        Pace.on("hide", function() {
            $("#resume").removeClass("out").addClass("fade");
            //loadPhoto();
        });
    })();

});
